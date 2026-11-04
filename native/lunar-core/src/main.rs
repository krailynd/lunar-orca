use lunar_core::{index_workspace, sanitize_terminal_stream, validate_deep_link};
use std::env;
use std::io::{self, Read};
use std::path::Path;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: lunar-core <sanitize-stream|index-workspace|validate-link> [args]");
        std::process::exit(1);
    }

    match args[1].as_str() {
        "sanitize-stream" => {
            let mut buffer = String::new();
            if let Err(e) = io::stdin().read_to_string(&mut buffer) {
                eprintln!("Failed to read stdin: {}", e);
                std::process::exit(1);
            }
            let res = sanitize_terminal_stream(&buffer);
            print!("{}", res.cleaned_text);
        }
        "index-workspace" => {
            let path_str = args.get(2).map(|s| s.as_str()).unwrap_or(".");
            let max_depth = args.get(3).and_then(|s| s.parse::<usize>().ok()).unwrap_or(8);

            match index_workspace(Path::new(path_str), max_depth) {
                Ok(index) => {
                    let json = serde_json::to_string(&index).unwrap_or_else(|_| "{}".to_string());
                    println!("{}", json);
                }
                Err(e) => {
                    eprintln!("Index error: {}", e);
                    std::process::exit(1);
                }
            }
        }
        "validate-link" => {
            let link = args.get(2).map(|s| s.as_str()).unwrap_or("");
            let res = validate_deep_link(link);
            let json = serde_json::to_string(&res).unwrap_or_else(|_| "{}".to_string());
            println!("{}", json);
        }
        _ => {
            eprintln!("Unknown command: {}", args[1]);
            std::process::exit(1);
        }
    }
}
