OUTDIR = "../perf/arm64"

blstrs:
	mkdir -p ../perf/arm64
	cd blstrs; cargo bench
	mv blstrs/target/criterion/ $(OUTDIR)/blstrs/

.PHONY: blstrs