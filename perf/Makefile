OUTDIR=../frontend/src/

all: blstrs arkworks

blstrs:
	python fit.py blstrs/estimates.json
	mv results.json $(OUTDIR)/results_blstrs.json

arkworks:
	python fit.py arkworks/estimates.json
	mv results.json $(OUTDIR)/results_arkworks.json

.PHONY: blstrs arkworks
