use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FileEntry {
    pub relative_path: String,
    pub size_bytes: u64,
    pub is_directory: bool,
    pub modified_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceIndexResult {
    pub total_files: usize,
    pub total_directories: usize,
    pub duration_micros: u128,
    pub entries: Vec<FileEntry>,
}

const DEFAULT_IGNORED_DIRS: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    "dist",
    "out",
    ".cache",
    ".next",
    ".turbo",
    ".cargo",
    "vendor",
    "coverage",
];

/// Recursively index a workspace root.
/// Enforces sandbox boundary: canonicalizes root and rejects symlink escapes outside the root directory.
pub fn index_workspace(root_path: &Path, max_depth: usize) -> Result<WorkspaceIndexResult, String> {
    let start = std::time::Instant::now();
    let canonical_root = fs::canonicalize(root_path)
        .map_err(|e| format!("Invalid workspace root: {}", e))?;

    let mut entries = Vec::new();
    let mut total_files = 0;
    let mut total_directories = 0;

    scan_directory(
        &canonical_root,
        &canonical_root,
        0,
        max_depth,
        &mut entries,
        &mut total_files,
        &mut total_directories,
    )?;

    let elapsed = start.elapsed().as_micros();

    Ok(WorkspaceIndexResult {
        total_files,
        total_directories,
        duration_micros: elapsed,
        entries,
    })
}

fn scan_directory(
    root: &Path,
    current: &Path,
    depth: usize,
    max_depth: usize,
    entries: &mut Vec<FileEntry>,
    total_files: &mut usize,
    total_directories: &mut usize,
) -> Result<(), String> {
    if depth > max_depth {
        return Ok(());
    }

    let read_dir = match fs::read_dir(current) {
        Ok(rd) => rd,
        Err(_) => return Ok(()), // Skip unreadable directories gracefully
    };

    for entry in read_dir.flatten() {
        let path = entry.path();
        let file_name = entry.file_name();
        let name_str = file_name.to_string_lossy();

        let metadata = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        let is_dir = metadata.is_dir();

        // Check if directory is in ignored set
        if is_dir && DEFAULT_IGNORED_DIRS.contains(&name_str.as_ref()) {
            continue;
        }

        // Validate boundary: canonical path must stay within root (anti-symlink escape)
        if let Ok(canon) = fs::canonicalize(&path) {
            if !canon.starts_with(root) {
                // Potential path traversal or symlink escape, skip!
                continue;
            }
        }

        let relative = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .replace('\\', "/");

        let modified_ms = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);

        if is_dir {
            *total_directories += 1;
            entries.push(FileEntry {
                relative_path: relative,
                size_bytes: 0,
                is_directory: true,
                modified_ms,
            });

            scan_directory(
                root,
                &path,
                depth + 1,
                max_depth,
                entries,
                total_files,
                total_directories,
            )?;
        } else {
            *total_files += 1;
            entries.push(FileEntry {
                relative_path: relative,
                size_bytes: metadata.len(),
                is_directory: false,
                modified_ms,
            });
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::Write;

    #[test]
    fn test_index_temporary_directory() {
        let temp_dir = std::env::temp_dir().join(format!("lunar_core_test_{}", std::process::id()));
        let _ = fs::create_dir_all(&temp_dir);

        let sub_dir = temp_dir.join("src");
        let _ = fs::create_dir_all(&sub_dir);

        let file1 = temp_dir.join("README.md");
        let mut f1 = File::create(&file1).unwrap();
        f1.write_all(b"# Hello").unwrap();

        let file2 = sub_dir.join("main.rs");
        let mut f2 = File::create(&file2).unwrap();
        f2.write_all(b"fn main() {}").unwrap();

        // Also test ignored folder
        let git_dir = temp_dir.join(".git");
        let _ = fs::create_dir_all(&git_dir);
        let git_file = git_dir.join("HEAD");
        let mut gf = File::create(&git_file).unwrap();
        gf.write_all(b"ref: refs/heads/main").unwrap();

        let res = index_workspace(&temp_dir, 10).expect("Scan should succeed");
        assert_eq!(res.total_files, 2);
        assert_eq!(res.total_directories, 1); // Only "src", not ".git"

        let paths: Vec<String> = res.entries.into_iter().map(|e| e.relative_path).collect();
        assert!(paths.contains(&"README.md".to_string()));
        assert!(paths.contains(&"src/main.rs".to_string()));
        assert!(!paths.contains(&".git".to_string()));

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
