OUTDIR=../perf/data/new/

all: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto pairing_ce halo2_curves ffjavascript

init:
	cargo install cargo-criterion
	cd ffjavascript; npm i
	mkdir -p $(OUTDIR)
	mkdir -p $(OUTDIR)/{arkworks,blstrs,curve25519-dalek,pasta_curves,zkcrypto,pairing_ce,halo2_curves,gnark_crypto,ffjavascript}

blstrs:
	cd blstrs; cargo criterion --message-format=json 1> ../$(OUTDIR)/blstrs/blstrs-control.json

arkworks:
	cd arkworks; cargo criterion --message-format=json 1> ../$(OUTDIR)/arkworks/arkworks-control.json

curve25519-dalek:
	cd curve25519-dalek; cargo criterion --message-format=json 1> ../$(OUTDIR)/curve25519-dalek/curve25519-dalek-control.json

pasta_curves:
	cd pasta_curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/pasta_curves/pasta_curves-control.json

zkcrypto:
	cd zkcrypto; cargo criterion --message-format=json 1> ../$(OUTDIR)/zkcrypto/zkcrypto-control.json

pairing_ce:
	cd pairing_ce; cargo criterion --message-format=json 1> ../$(OUTDIR)/pairing_ce/pairing_ce-control.json

halo2_curves:
	cd halo2_curves; cargo criterion --message-format=json 1> ../$(OUTDIR)/halo2_curves/halo2_curves-control.json

gnark:
	git clone -b zkalc https://github.com/ConsenSys/gnark-crypto.git || true
	cd gnark-crypto && \
	bash ./zkalc.sh bls12-381 | tee ../$(OUTDIR)/gnark_crypto/gnark-bls12_381.txt && \
	bash ./zkalc.sh bls12-377 | tee ../$(OUTDIR)/gnark_crypto/gnark-bls12_377.txt && \
	bash ./zkalc.sh bn254     | tee ../$(OUTDIR)/gnark_crypto/gnark-bn254.txt && \
	bash ./zkalc.sh secp256k1 | tee ../$(OUTDIR)/gnark_crypto/gnark-secp256k1.txt

ffjavascript:
	cd ffjavascript; node bench.js 2> ../$(OUTDIR)/ffjavascript/ffjavascript-control.json

clean:
	@rm -rf curves
	@rm -rf gnark-crypto
	@rm -rf $(OUTDIR)

.PHONY: init blstrs arkworks curve25519-dalek pasta_curves zkcrypto pairing_ce halo2_curves arkworks_curves_benchmarks ffjavascript clean
