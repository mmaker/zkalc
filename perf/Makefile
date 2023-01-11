OUTDIR=../frontend/data/

all: blstrs arkworks

blstrs:
	./fit.py < blstrs/estimates.json > $(OUTDIR)/results_blstrs.json 2> /dev/null

arkworks:
	./fit.py <  arkworks/estimates.json > $(OUTDIR)/results_arkworks.json 2> /dev/null

.PHONY: blstrs arkworks
