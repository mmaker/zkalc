OUTDIR=../perf/data/new/

all: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto gnark pairing_ce

init:
	cargo install cargo-criterion
	cd ffjavascript; npm i
	mkdir -p $(OUTDIR)

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> ../$(OUTDIR)/blstrs.json

arkworks: arkworks_curves
	cd arkworks; cargo criterion --message-format=json 1> ../$(OUTDIR)/arkworks.json

arkworks_curves:
	git clone https://github.com/arkworks-rs/curves.git || true
	cd curves; cargo criterion --features ark-ec/parallel,ark-ff/asm --message-format=json 1> ../$(OUTDIR)/ark-curves.json

curve25519-dalek:
	cd curve25519-dalek; cargo criterion --message-format=json 1> ../$(OUTDIR)/curve25519-dalek.json

pasta_curves:
	cd pasta_curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/pasta_curves.json

zkcrypto:
	cd zkcrypto; cargo criterion --message-format=json 1> ../$(OUTDIR)/zkcrypto.json

pairing_ce:
	cd pairing_ce; cargo criterion --message-format=json 1> ../$(OUTDIR)/pairing_ce.json

gnark:
	git clone -b zkalc https://github.com/ConsenSys/gnark-crypto.git || true
	cd gnark-crypto && \
	bash ./zkalc.sh bls12-381 | tee ../$(OUTDIR)/gnark-bls12-381.txt && \
	bash ./zkalc.sh bls12-377 | tee ../$(OUTDIR)/gnark-bls12-377.txt && \
	bash ./zkalc.sh bn254     | tee ../$(OUTDIR)/gnark-bn254.txt && \
	bash ./zkalc.sh secp256k1 | tee ../$(OUTDIR)/gnark-secp256k1.txt

ffjavascript:
	cd ffjavascript; node bench.js > ../$(OUTDIR)/ffjavascript.json

clean:
	@rm -rf curves
	@rm -rf gnark-crypto
	@rm -rf $(OUTDIR)

.PHONY: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto pairing_ce arkworks_curves_benchmarks ffjavascript clean
