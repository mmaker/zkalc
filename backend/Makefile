OUTDIR=../perf/data/new/

all: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto

init:
	cargo install cargo-criterion
	mkdir -p $(OUTDIR)

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> ../$(OUTDIR)/blstrs.json

arkworks: arkworks_curves_benchmarks
	cd arkworks; cargo criterion --message-format=json 1> ../$(OUTDIR)/arkworks.json

arkworks_curves_benchmarks:
	git clone https://github.com/arkworks-rs/curves
	cd curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/ark-curves.json

curve25519-dalek:
	cd curve25519-dalek; cargo criterion --message-format=json 1> ../$(OUTDIR)/curve25519-dalek.json

pasta_curves:
	cd pasta_curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/pasta_curves.json

zkcrypto:
	cd zkcrypto; cargo criterion --message-format=json 1> ../$(OUTDIR)/zkcrypto.json

.PHONY: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto arkworks_curves_benchmarks
