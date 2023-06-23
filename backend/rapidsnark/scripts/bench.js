#!/usr/bin/env node

// Measuring arithmetics and curve operations for ffiasm
import tmp from "tmp-promise";
import path from "path";
import util from "util";
import fs from "fs";
import { fileURLToPath } from 'url';
import bigInt from "big-integer";
import { buildZqField } from "ffiasm";
import child_process from "child_process"

const currentModuleUrl = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleUrl);
const __dirname = path.dirname(currentModulePath);

const exec = util.promisify(child_process.exec);

async function generate_field(dir, prime, name) {
    const source = await buildZqField(prime, name);

    // Patch the generated file
    // Define the new line to be added
    let newLine = 'extern "C" bool ' + name + '_init();\n';
    // Use regular expressions to find and modify the string
    source.hpp = source.hpp.replace(/(extern "C" void[^\n]+\n)/, newLine + '$1');

    let lower_name = name.toLowerCase();

    await fs.promises.writeFile(path.join(dir.path, lower_name + ".asm"), source.asm, "utf8");
    await fs.promises.writeFile(path.join(dir.path, lower_name + ".hpp"), source.hpp, "utf8");
    await fs.promises.writeFile(path.join(dir.path, lower_name + ".cpp"), source.cpp, "utf8");

    if (process.platform === "darwin") {
        await exec("nasm -fmacho64 --prefix _ " +
            ` ${path.join(dir.path, lower_name + ".asm")}`
        );
    }  else if (process.platform === "linux") {
        await exec("nasm -felf64 " +
            ` ${path.join(dir.path, lower_name + ".asm")}`
        );
    } else throw("Unsupported platform");
}

async function benchmarkMM() {
    const dir = await tmp.dir({prefix: "ffiasm", unsafeCleanup: true });

    // Those are hardcoded for bn254 rn
    await generate_field(dir, bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617"), "Fr");
    await generate_field(dir, bigInt("21888242871839275222246405745257275088696311157297823662689037894645226208583"), "Fq");

    await exec(`cp  ${path.join(__dirname, "..", "src", "bench.cpp")} ${dir.path}`);

    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "alt_bn128.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "alt_bn128.cpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "f2field.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "f2field.cpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "splitparstr.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "splitparstr.cpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "curve.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "curve.cpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "exp.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "naf.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "naf.cpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "multiexp.cpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "multiexp.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "misc.hpp")} ${dir.path}`);
    await exec(`cp  ${path.join(__dirname, "..", "node_modules", "ffiasm", "c", "misc.cpp")} ${dir.path}`);

    const nanobench_o = path.join(__dirname, "..", "lib", "nanobench.o");

    if (!fs.existsSync(nanobench_o)) {
        await exec("g++" +
        ` -I${path.join(__dirname, "..", "include")} ` +
        ` -c ${path.join(__dirname, "..", "src", "nanobench.cpp")}` +
        " -o " + nanobench_o +
        " -O3"
        );

    }

    await exec("g++" +
       ` ${path.join(dir.path,  "bench.cpp")}` +
       ` ${path.join(dir.path,  "alt_bn128.cpp")}` +
       ` ${path.join(dir.path,  "splitparstr.cpp")}` +
       ` ${path.join(dir.path,  "misc.cpp")}` +
       ` ${path.join(dir.path,  "naf.cpp")}` +
       ` ${path.join(dir.path,  "fr.o")}` +
       ` ${path.join(dir.path,  "fr.cpp")}` +
       ` ${path.join(dir.path,  "fq.o")}` +
       ` ${path.join(dir.path,  "fq.cpp")}` +
       " " + nanobench_o + 
       ` -o ${path.join(dir.path, "benchmark")}` +
       ` -I${path.join(__dirname, "..", "include")} ` +
       " -lgmp -fopenmp -O3"
    );

    // ignore x and y for now
    let result = await exec(`${path.join(dir.path,  "benchmark")}`);

    if (result.stdout === '') {
          throw new Error("benchmark stdout is empty");
    }

    if (result.stderr !== '') {
          throw new Error("benchmark stderr is not empty");
    }


    return result.stdout;
}

async function run () {
    // Execute benchmark
    let results = await benchmarkMM();
    console.log(results);
}

run().then(() => {
    process.exit(0);
});