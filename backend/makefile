OUTDIR="../perf/"

all: init blstrs arkworks

init:
	cargo install cargo-criterion

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> estimates.json
	mkdir $(OUTDIR)/blstrs
	mv estimates.json $(OUTDIR)/blstrs/

arkworks:
	cd arkworks; cargo criterion --message-format=json 1> estimates.json
	mkdir $(OUTDIR)/arkworks
	mv estimates.json $(OUTDIR)/arkworks/


.PHONY: init blstrs arkworks