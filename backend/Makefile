OUTDIR=../perf/

all: init blstrs arkworks

init:
	cargo install cargo-criterion

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> estimates.json
	mkdir -p $(OUTDIR)/blstrs
	mv blstrs/estimates.json $(OUTDIR)/blstrs/

arkworks:
	cd arkworks; cargo criterion --message-format=json 1> estimates.json
	mkdir -p $(OUTDIR)/arkworks
	mv arkworks/estimates.json $(OUTDIR)/arkworks/


.PHONY: init blstrs arkworks
