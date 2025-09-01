# LaTeX Setup Guide for macOS

This guide documents the complete LaTeX setup process performed on your MacBook Pro with 24GB memory, including local PDF rendering and system-wide LaTeX functionality.

## Installation Process

### 1. Install BasicTeX (LaTeX Distribution)

BasicTeX was installed instead of the full MacTeX to save space and avoid download timeouts:

```bash
brew install --cask basictex
```

**Note:** The installation requires administrator privileges and will prompt for your password. If the command fails due to sudo requirements, the installer package can be opened manually:

```bash
open ~/Library/Caches/Homebrew/downloads/*mactex-basictex*.pkg
```

### 2. Configure PATH

After installation, LaTeX binaries need to be added to your system PATH:

```bash
# Add to your shell profile (.zshrc or .bash_profile)
export PATH="/Library/TeX/texbin:$PATH"

# Apply immediately
eval "$(/usr/libexec/path_helper)"
source ~/.zshrc  # or ~/.bash_profile
```

### 3. Verify Installation

Check that LaTeX is properly installed:

```bash
pdflatex --version    # Should show pdfTeX version
lualatex --version    # Should show LuaHBTeX version
which pdflatex        # Should show /Library/TeX/texbin/pdflatex
```

## Project Integration

### For Node.js/npm Projects

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "latex:build": "cd docs/latex && lualatex -interaction=nonstopmode document.tex",
    "latex:watch": "cd docs/latex && make watch",
    "latex:clean": "cd docs/latex && make clean",
    "latex:open": "cd docs/latex && make build-open"
  }
}
```

### Create a Makefile

Place this `Makefile` in your LaTeX directory (e.g., `docs/latex/`):

```makefile
# LaTeX Makefile
LATEX = lualatex
MAIN = your-document-name
SRC = $(MAIN).tex
PDF = $(MAIN).pdf
LATEX_FLAGS = -interaction=nonstopmode -file-line-error

# Default target
all: $(PDF)

# Build PDF with LuaLaTeX (recommended for better font handling)
$(PDF): $(SRC)
	$(LATEX) $(LATEX_FLAGS) $(SRC)
	$(LATEX) $(LATEX_FLAGS) $(SRC)  # Run twice for references

# Quick build (single pass)
quick: $(SRC)
	$(LATEX) $(LATEX_FLAGS) $(SRC)

# Watch for changes and rebuild automatically
watch:
	@echo "Watching for changes in $(SRC)..."
	@while true; do \
		make -s $(PDF); \
		echo "Waiting for changes..."; \
		fswatch -1 $(SRC) > /dev/null 2>&1 || sleep 2; \
	done

# Clean auxiliary files
clean:
	rm -f $(MAIN).aux $(MAIN).log $(MAIN).out $(MAIN).toc \
		$(MAIN).lot $(MAIN).lof $(MAIN).nav $(MAIN).snm \
		$(MAIN).vrb $(MAIN).bbl $(MAIN).blg $(MAIN).idx \
		$(MAIN).ilg $(MAIN).ind $(MAIN).fls $(MAIN).fdb_latexmk \
		$(MAIN).synctex.gz

# Build and open
build-open: $(PDF)
	open $(PDF)

.PHONY: all quick watch clean build-open
```

### Git Integration

Add LaTeX build artifacts to your `.gitignore`:

```gitignore
# LaTeX build artifacts
*.aux
*.log
*.out
*.toc
*.lot
*.lof
*.nav
*.snm
*.vrb
*.bbl
*.blg
*.idx
*.ilg
*.ind
*.fls
*.fdb_latexmk
*.synctex.gz
*.synctex(busy)

# Keep specific PDFs if needed (optional)
# !docs/latex/important-document.pdf
```

## Global LaTeX System

### Shell Functions

Add these functions to your shell profile (`~/.zshrc` or `~/.bash_profile`) for system-wide LaTeX functionality:

```bash
# LaTeX utility functions
latex-compile() {
    if [ $# -lt 1 ]; then
        echo "Usage: latex-compile <filename>"
        return 1
    fi
    
    echo "Compiling $1..."
    lualatex -interaction=nonstopmode -file-line-error "$1"
    lualatex -interaction=nonstopmode -file-line-error "$1"
    echo "✅ Compiled $1 -> ${1%.tex}.pdf"
}

latex-watch() {
    if [ $# -lt 1 ]; then
        echo "Usage: latex-watch <filename>"
        return 1
    fi
    
    if ! command -v fswatch &> /dev/null; then
        echo "Installing fswatch for file watching..."
        brew install fswatch
    fi
    
    echo "Watching $1 for changes..."
    fswatch -o "$1" | while read f; do
        latex-compile "$1"
    done
}

latex-clean() {
    echo "Cleaning LaTeX build artifacts..."
    rm -f *.aux *.log *.out *.toc *.lot *.lof *.nav *.snm *.vrb
    rm -f *.bbl *.blg *.idx *.ilg *.ind *.fls *.fdb_latexmk
    rm -f *.synctex.gz *.synctex\(busy\)
    echo "✅ Clean complete"
}

latex-view() {
    if [ $# -lt 1 ]; then
        echo "Usage: latex-view <filename>"
        return 1
    fi
    
    PDF="${1%.tex}.pdf"
    if [ -f "$PDF" ]; then
        open "$PDF"
    else
        echo "PDF not found: $PDF"
        return 1
    fi
}

# Shortcuts
alias ltex='latex-compile'
alias ltexw='latex-watch'
alias ltexc='latex-clean'
alias ltexv='latex-view'
```

### Document Templates

Create a templates directory at `~/.latex-templates/` with common document types:

#### Article Template (`~/.latex-templates/article.tex`):
```latex
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath,amssymb,amsthm}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage[margin=1in]{geometry}
\usepackage{xcolor}

% Custom commands
\newcommand{\code}[1]{\textcolor{blue}{\texttt{#1}}}

\title{Document Title}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle

\section{Introduction}
Your content here.

\end{document}
```

#### Template Usage Function:
```bash
latex-new() {
    if [ $# -lt 2 ]; then
        echo "Usage: latex-new <template> <name>"
        echo "Available templates: article, report, math, beamer"
        return 1
    fi
    
    TEMPLATE="$HOME/.latex-templates/$1.tex"
    OUTPUT="$2.tex"
    
    if [ ! -f "$TEMPLATE" ]; then
        echo "Template not found: $1"
        return 1
    fi
    
    cp "$TEMPLATE" "$OUTPUT"
    echo "Created $OUTPUT from template $1"
}
```

## Best Practices

### 1. Use LuaLaTeX Instead of pdfLaTeX

LuaLaTeX handles fonts better and is more robust:
```bash
lualatex document.tex  # Instead of pdflatex
```

### 2. Watch Script for Development

Use file watching for automatic compilation during editing:
```bash
# Install fswatch if needed
brew install fswatch

# Watch and auto-compile
latex-watch document.tex
```

### 3. Two-Pass Compilation

Always run LaTeX twice for proper references and cross-links:
```bash
lualatex document.tex
lualatex document.tex
```

### 4. Handle Missing Packages

If you get "package not found" errors, install them:
```bash
# Install specific package (requires password)
sudo /Library/TeX/texbin/tlmgr install package-name

# Update package manager
sudo /Library/TeX/texbin/tlmgr update --self
```

## Common Commands

| Command | Description |
|---------|-------------|
| `lualatex file.tex` | Compile LaTeX to PDF |
| `latex-compile file.tex` | Compile with our function (double pass) |
| `latex-watch file.tex` | Auto-compile on changes |
| `latex-clean` | Remove build artifacts |
| `latex-view file.tex` | Open generated PDF |
| `latex-new article myfile` | Create new document from template |

## Troubleshooting

### PATH Issues
If `pdflatex` is not found after installation:
```bash
eval "$(/usr/libexec/path_helper)"
source ~/.zshrc
```

### Font Issues
Use LuaLaTeX instead of pdfLaTeX:
```bash
lualatex file.tex  # Better font handling
```

### Permission Errors
Some package installations require sudo:
```bash
sudo /Library/TeX/texbin/tlmgr install package-name
```

### File Watching
Install fswatch for automatic compilation:
```bash
brew install fswatch
```

## Using in New Projects

1. **Copy the Makefile** to your project's LaTeX directory
2. **Update the MAIN variable** in the Makefile to your document name
3. **Add npm scripts** if it's a Node.js project
4. **Update .gitignore** to exclude build artifacts
5. **Use `latex-compile` or `make`** to build your documents

## Example Project Structure

```
your-project/
├── docs/
│   └── latex/
│       ├── Makefile
│       ├── document.tex
│       ├── document.pdf (generated)
│       └── README.md
├── package.json (with latex scripts)
└── .gitignore (with latex exclusions)
```

This setup provides a complete, professional LaTeX environment that works both locally and across multiple projects on your Mac.