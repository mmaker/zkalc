OUTDIR=../perf/data/new/

all: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto gnark pairing_ce halo2_curves ffjavascript

init:
	cargo install cargo-criterion
	cd ffjavascript; npm i
	mkdir -p $(OUTDIR)
	mkdir -p $(OUTDIR)/{arkworks,blstrs,curve25519-dalek,pasta_curves,zkcrypto,pairing_ce,halo2_curves,gnark_crypto,ffjavascript}

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> ../$(OUTDIR)/blstrs/blstrs.json

arkworks: arkworks_curves
	cd arkworks; cargo criterion --message-format=json 1> ../$(OUTDIR)/arkworks/arkworks.json

arkworks_curves:
	git clone -b releases https://github.com/arkworks-rs/curves.git || true
	cd curves; cargo criterion --features ark-ec/parallel,ark-ff/asm --message-format=json 1> ../$(OUTDIR)/arkworks/ark-curves.json

curve25519-dalek:
	cd curve25519-dalek; cargo criterion --message-format=json 1> ../$(OUTDIR)/curve25519-dalek/curve25519-dalek.json

pasta_curves:
	cd pasta_curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/pasta_curves/pasta_curves.json

zkcrypto:
	cd zkcrypto; cargo criterion --message-format=json 1> ../$(OUTDIR)/zkcrypto/zkcrypto.json

pairing_ce:
	cd pairing_ce; cargo criterion --message-format=json 1> ../$(OUTDIR)/pairing_ce/pairing_ce.json

halo2_curves:
	cd halo2_curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/halo2_curves/halo2_curves.json

gnark:
	git clone -b zkalc https://github.com/ConsenSys/gnark-crypto.git || true
	cd gnark-crypto && \
	bash ./zkalc.sh bls12-381 | tee ../$(OUTDIR)/gnark_crypto/gnark-bls12_381.txt && \
	bash ./zkalc.sh bls12-377 | tee ../$(OUTDIR)/gnark_crypto/gnark-bls12_377.txt && \
	bash ./zkalc.sh bn254     | tee ../$(OUTDIR)/gnark_crypto/gnark-bn254.txt && \
	bash ./zkalc.sh secp256k1 | tee ../$(OUTDIR)/gnark_crypto/gnark-secp256k1.txt

ffjavascript:
	cd ffjavascript; node bench.js 2> ../$(OUTDIR)/ffjavascript/ffjavascript.json

clean:
	@rm -rf curves
	@rm -rf gnark-crypto
	@rm -rf $(OUTDIR)

.PHONY: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto pairing_ce halo2_curves arkworks_curves_benchmarks ffjavascript clean
