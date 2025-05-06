import os

# Folders to ignore
EXCLUDE_DIRS = {'venv', '__pycache__', '.git', 'node_modules', '.idea', '.vscode'}

def print_tree(root_path='.', prefix=''):
    folders = [
        name for name in sorted(os.listdir(root_path))
        if os.path.isdir(os.path.join(root_path, name)) and name not in EXCLUDE_DIRS
    ]

    for idx, folder in enumerate(folders):
        connector = '└── ' if idx == len(folders) - 1 else '├── '
        print(f"{prefix}{connector}{folder}")
        sub_prefix = '    ' if idx == len(folders) - 1 else '│   '
        print_tree(os.path.join(root_path, folder), prefix + sub_prefix)

if __name__ == '__main__':
    print(f"{os.path.basename(os.getcwd())}/")
    print_tree()
