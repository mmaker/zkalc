OUTDIR=../perf/data/

all: init blstrs arkworks curve25519-dalek

init:
	cargo install cargo-criterion

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> machine.json
	mkdir -p $(OUTDIR)/blstrs
	mv blstrs/machine.json $(OUTDIR)/blstrs/

arkworks:
	cd arkworks; cargo criterion --message-format=json 1> machine.json
	mkdir -p $(OUTDIR)/arkworks
	mv arkworks/machine.json $(OUTDIR)/arkworks/

curve25519-dalek:
	cd curve25519-dalek; cargo criterion --message-format=json 1> machine.json
	mkdir -p $(OUTDIR)/curve25519/curve25519-dalek/
	mv curve25519-dalek/machine.json $(OUTDIR)/curve25519/curve25519-dalek/

.PHONY: init blstrs arkworks curve25519-dalek
