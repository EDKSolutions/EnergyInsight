# LaTeX Makefile for energy-calculations.tex
# Compiler settings
LATEX = pdflatex
XELATEX = xelatex
LUALATEX = lualatex
BIBTEX = bibtex

# Main file settings
MAIN = energy-calculations
SRC = $(MAIN).tex
PDF = $(MAIN).pdf

# Compiler flags
LATEX_FLAGS = -interaction=nonstopmode -file-line-error

# Default target
all: $(PDF)

# Build PDF with LuaLaTeX (default)
$(PDF): $(SRC)
	$(LUALATEX) $(LATEX_FLAGS) $(SRC)
	$(LUALATEX) $(LATEX_FLAGS) $(SRC)  # Run twice for references

# Build with XeLaTeX (for better font support)
xelatex: $(SRC)
	$(XELATEX) $(LATEX_FLAGS) $(SRC)
	$(XELATEX) $(LATEX_FLAGS) $(SRC)

# Build with LuaLaTeX (for advanced features)
lualatex: $(SRC)
	$(LUALATEX) $(LATEX_FLAGS) $(SRC)
	$(LUALATEX) $(LATEX_FLAGS) $(SRC)

# Quick build (single pass)
quick: $(SRC)
	$(LATEX) $(LATEX_FLAGS) $(SRC)

# Full build with bibliography (if needed)
full: $(SRC)
	$(LATEX) $(LATEX_FLAGS) $(SRC)
	$(BIBTEX) $(MAIN)
	$(LATEX) $(LATEX_FLAGS) $(SRC)
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

# Clean everything including PDF
cleanall: clean
	rm -f $(PDF)

# Open PDF after building
open: $(PDF)
	open $(PDF)

# Build and open
build-open: $(PDF)
	open $(PDF)

# Help
help:
	@echo "LaTeX Makefile Commands:"
	@echo "  make            - Build PDF with pdflatex"
	@echo "  make xelatex    - Build PDF with XeLaTeX"
	@echo "  make lualatex   - Build PDF with LuaLaTeX"
	@echo "  make quick      - Quick build (single pass)"
	@echo "  make full       - Full build with bibliography"
	@echo "  make watch      - Watch for changes and auto-rebuild"
	@echo "  make clean      - Remove auxiliary files"
	@echo "  make cleanall   - Remove all generated files"
	@echo "  make open       - Build and open PDF"
	@echo "  make build-open - Build and open PDF"
	@echo "  make help       - Show this help message"

.PHONY: all xelatex lualatex quick full watch clean cleanall open build-open help