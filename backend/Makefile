OUTDIR=../perf/data/new/

all: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto

init:
	cargo install cargo-criterion
	mkdir -p $(OUTDIR)

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> ../$(OUTDIR)/blstrs.json

arkworks: arkworks_curves
	cd arkworks; cargo criterion --message-format=json 1> ../$(OUTDIR)/arkworks.json

arkworks_curves:
	git clone https://github.com/arkworks-rs/curves || true
	cd curves; cargo criterion --features ark-ec/parallel,ark-ff/asm --message-format=json 1> ../$(OUTDIR)/ark-curves.json

curve25519-dalek:
	cd curve25519-dalek; cargo criterion --message-format=json 1> ../$(OUTDIR)/curve25519-dalek.json

pasta_curves:
	cd pasta_curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/pasta_curves.json

zkcrypto:
	cd zkcrypto; cargo criterion --message-format=json 1> ../$(OUTDIR)/zkcrypto.json

clean:
	@rm -rf curves
	@rm -rf $(OUTDIR)

.PHONY: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto arkworks_curves_benchmarks clean
