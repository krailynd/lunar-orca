use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeepLinkValidation {
    pub is_valid: bool,
    pub action: String,
    pub target_resource: Option<String>,
    pub blocked_reason: Option<String>,
}

/// Validates and sanitizes `orca://` and `lunar://` deep-links before forwarding to Electron main/renderer.
/// Prevents parameter injection, command execution flags, and protocol-handler RCEs.
pub fn validate_deep_link(url_str: &str) -> DeepLinkValidation {
    if !url_str.starts_with("orca://") && !url_str.starts_with("lunar://") {
        return DeepLinkValidation {
            is_valid: false,
            action: String::new(),
            target_resource: None,
            blocked_reason: Some("Invalid protocol scheme (must be orca:// or lunar://)".to_string()),
        };
    }

    // Check for command injection characters in URL
    if url_str.contains(';') || url_str.contains('|') || url_str.contains('&') || url_str.contains('`') || url_str.contains('$') {
        return DeepLinkValidation {
            is_valid: false,
            action: String::new(),
            target_resource: None,
            blocked_reason: Some("Potentially malicious shell metacharacters detected in deep link".to_string()),
        };
    }

    // Strip scheme
    let payload = if let Some(stripped) = url_str.strip_prefix("orca://") {
        stripped
    } else if let Some(stripped) = url_str.strip_prefix("lunar://") {
        stripped
    } else {
        url_str
    };

    let mut parts = payload.splitn(2, '?');
    let action = parts.next().unwrap_or("").trim_matches('/').to_string();
    let query = parts.next().unwrap_or("");

    // Allowlist permitted deep-link actions
    match action.as_str() {
        "open" | "skill" | "auth" | "workspace" | "chat" => {
            DeepLinkValidation {
                is_valid: true,
                action,
                target_resource: if query.is_empty() { None } else { Some(query.to_string()) },
                blocked_reason: None,
            }
        }
        _ => {
            DeepLinkValidation {
                is_valid: false,
                action,
                target_resource: None,
                blocked_reason: Some("Disallowed deep-link action".to_string()),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_deep_link() {
        let valid = validate_deep_link("orca://skill?id=anthropic-agent");
        assert!(valid.is_valid);
        assert_eq!(valid.action, "skill");
        assert_eq!(valid.target_resource, Some("id=anthropic-agent".to_string()));
    }

    #[test]
    fn test_blocks_shell_injection_in_deep_link() {
        let exploit = "orca://open?repo=https://github.com/foo/bar;rm -rf /";
        let res = validate_deep_link(exploit);
        assert!(!res.is_valid);
        assert!(res.blocked_reason.is_some());
    }

    #[test]
    fn test_blocks_unknown_action() {
        let invalid = validate_deep_link("orca://execute-system-binary?bin=curl");
        assert!(!invalid.is_valid);
    }
}
