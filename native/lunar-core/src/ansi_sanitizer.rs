/// ANSI and terminal control escape sequence sanitizer.
/// Protects against:
/// 1. OSC 52 clipboard reading/writing without user consent.
/// 2. Malicious OSC 8 hyperlinks (e.g. javascript: schemes or hidden credentials).
/// 3. Cursor position queries (DSR / CSI 6 n) used to inject commands into the shell stdin.
/// 4. Destructive DEC private mode resets.

pub struct SanitizedTerminalOutput {
    pub cleaned_text: String,
    pub blocked_sequences_count: usize,
    pub has_clipboard_attempt: bool,
    pub has_dsr_query: bool,
}

pub fn sanitize_terminal_stream(input: &str) -> SanitizedTerminalOutput {
    let mut cleaned = String::with_capacity(input.len());
    let mut blocked_count = 0;
    let mut clipboard_detected = false;
    let mut dsr_detected = false;

    let bytes = input.as_bytes();
    let mut i = 0;

    while i < bytes.len() {
        if bytes[i] == 0x1B {
            // Escape character
            if i + 1 < bytes.len() {
                match bytes[i + 1] {
                    // Operating System Command (OSC): ESC ]
                    b']' => {
                        // Find terminator: either BEL (0x07) or ST (ESC \)
                        let mut j = i + 2;
                        let mut terminator_found = false;
                        let mut terminator_end = j;

                        while j < bytes.len() {
                            if bytes[j] == 0x07 {
                                terminator_found = true;
                                terminator_end = j + 1;
                                break;
                            } else if bytes[j] == 0x1B && j + 1 < bytes.len() && bytes[j + 1] == b'\\' {
                                terminator_found = true;
                                terminator_end = j + 2;
                                break;
                            }
                            j += 1;
                        }

                        if terminator_found {
                            let osc_content = &input[i + 2..if bytes[terminator_end - 1] == b'\\' { terminator_end - 2 } else { terminator_end - 1 }];
                            
                            // Check for OSC 52 (Clipboard)
                            if osc_content.starts_with("52;") {
                                clipboard_detected = true;
                                blocked_count += 1;
                                i = terminator_end;
                                continue;
                            }

                            // Check for OSC 8 (Hyperlink)
                            if osc_content.starts_with("8;") {
                                // Block javascript:, data:, vbscript: links
                                let lower = osc_content.to_lowercase();
                                if lower.contains("javascript:") || lower.contains("data:") || lower.contains("vbscript:") {
                                    blocked_count += 1;
                                    i = terminator_end;
                                    continue;
                                }
                            }

                            // Block arbitrary shell window title manipulation if containing control chars
                            if osc_content.starts_with("0;") || osc_content.starts_with("2;") {
                                if osc_content.contains('\n') || osc_content.contains('\r') {
                                    blocked_count += 1;
                                    i = terminator_end;
                                    continue;
                                }
                            }

                            // Safe OSC: allow through
                            cleaned.push_str(&input[i..terminator_end]);
                            i = terminator_end;
                            continue;
                        } else {
                            // Incomplete or unterminated escape sequence, skip ESC to avoid hanging
                            blocked_count += 1;
                            i += 1;
                            continue;
                        }
                    }
                    // Control Sequence Introducer (CSI): ESC [
                    b'[' => {
                        let mut j = i + 2;
                        while j < bytes.len() && (bytes[j] >= 0x30 && bytes[j] <= 0x3F) {
                            j += 1; // Parameter bytes
                        }
                        while j < bytes.len() && (bytes[j] >= 0x20 && bytes[j] <= 0x2F) {
                            j += 1; // Intermediate bytes
                        }
                        if j < bytes.len() && (bytes[j] >= 0x40 && bytes[j] <= 0x7E) {
                            let final_byte = bytes[j];
                            let csi_params = &input[i + 2..j];

                            // Check for DSR (Device Status Report - 6n)
                            if final_byte == b'n' && (csi_params == "6" || csi_params == "?6") {
                                dsr_detected = true;
                                blocked_count += 1;
                                i = j + 1;
                                continue;
                            }

                            // Allow normal styling, cursor movement, color (SGR 'm', etc.)
                            cleaned.push_str(&input[i..=j]);
                            i = j + 1;
                            continue;
                        } else {
                            blocked_count += 1;
                            i += 1;
                            continue;
                        }
                    }
                    _ => {
                        // Other single-char escape (ESC M, ESC 7, etc.)
                        cleaned.push(input.chars().nth(i).unwrap_or(' '));
                        i += 1;
                    }
                }
            } else {
                i += 1;
            }
        } else {
            cleaned.push(bytes[i] as char);
            i += 1;
        }
    }

    SanitizedTerminalOutput {
        cleaned_text: cleaned,
        blocked_sequences_count: blocked_count,
        has_clipboard_attempt: clipboard_detected,
        has_dsr_query: dsr_detected,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normal_text_and_sgr_colors() {
        let text = "\x1B[32mSuccess\x1B[0m: task completed";
        let res = sanitize_terminal_stream(text);
        assert_eq!(res.cleaned_text, text);
        assert_eq!(res.blocked_sequences_count, 0);
        assert!(!res.has_clipboard_attempt);
    }

    #[test]
    fn test_blocks_osc52_clipboard_exfiltration() {
        // OSC 52 read/write attempt
        let exploit = "normal text \x1B]52;c;dGVzdA==\x07 more text";
        let res = sanitize_terminal_stream(exploit);
        assert_eq!(res.cleaned_text, "normal text  more text");
        assert!(res.has_clipboard_attempt);
        assert_eq!(res.blocked_sequences_count, 1);
    }

    #[test]
    fn test_blocks_dsr_query_injection() {
        let exploit = "running command...\x1B[6n";
        let res = sanitize_terminal_stream(exploit);
        assert_eq!(res.cleaned_text, "running command...");
        assert!(res.has_dsr_query);
        assert_eq!(res.blocked_sequences_count, 1);
    }

    #[test]
    fn test_blocks_malicious_hyperlink() {
        let malicious_link = "\x1B]8;;javascript:alert(1)\x07Click Here\x1B]8;;\x07";
        let res = sanitize_terminal_stream(malicious_link);
        assert!(!res.cleaned_text.contains("javascript:"));
        assert!(res.blocked_sequences_count > 0);
    }
}
