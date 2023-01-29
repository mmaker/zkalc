import { InlineMath, BlockMath } from "react-katex";
import { Typography } from "antd";
import { estimates } from "../lib/estimates";

import machines from "../data/machines.json";
import libraries from "../data/libraries.json";
import curves from "../data/curves.json";

const { Text } = Typography;

export const operations = {
  msm_ff: {
    label: (
      <>
        Inner product in <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    description: (
      <>
        Sum of Products over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <>
        Given scalars{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and points{" "}
        <InlineMath math="b_1, b_2, \dots, b_n \in \mathbb{F}_p" /> compute{" "}
        <InlineMath math="\sum_i a_ib_i" />
      </>
    ),
  },
  msm_G1: {
    label: (
      <>
        MSM on <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    description: (
      <>
        Multiscalar multiplication(s) over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <>
        Given scalars{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and points{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_1" /> compute{" "}
        <InlineMath math="\sum_i a_iP_i" />
      </>
    ),
  },
  msm_G2: {
    label: (
      <>
        MSM on <InlineMath math="\mathbb{G}_2" />
      </>
    ),
    value: "msm_G2",
    description: (
      <>
        Multiscalar multiplication(s) over <InlineMath math="\mathbb{G}_2" />
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <>
        Given scalars{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and points{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_2" /> compute{" "}
        <InlineMath math="\sum_i a_iP_i" />
      </>
    ),
  },
  msm_Gt: {
    label: (
      <>
        Multi-pairing
      </>
    ),
    value: "msm_Gt",
    description: (
      <>
        Multi-pairing of <InlineMath math="\mathbb{G}_1" /> and <InlineMath math="\mathbb{G}_2" /> elements
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <>
        Given scalars{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_1" /> and points{" "}
        <InlineMath math="Q_1, Q_2, \dots, Q_n \in \mathbb{G}_2" /> compute{" "}
        <InlineMath math="\sum_i e(P_i, Q_i)" />
      </>
    ),
  },
  pairing: {
    label: "Pairing",
    value: "pairing",
    description: "Pairing(s)",
    tooltip_width: 200,
    tooltip: (
      <>
        Computation of <InlineMath>n</InlineMath> pairings
      </>
    ),
  },
  add_ff: {
    label: (
      <>
        Addition over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    description: (
      <>
        Field addition(s) over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given field elements{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> compute{" "}
        <InlineMath math="\sum_i a_i" />
      </>
    ),
  },
  mul_ff: {
    label: (
      <>
        Multiplication over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    description: (
      <>
        Field multiplication(s) over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given field elements{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> compute{" "}
        <InlineMath math="\prod_i a_i" />
      </>
    ),
  },
  mul_G1: {
    label: (
      <>
        Scalar mult. over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    description: (
      <>
        Scalar multiplication(s) over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_1" /> compute{" "}
        <InlineMath math="a_1 P_1, a_2 P_2, \dots, a_n P_n" />
        <br />
        <Text italic> without batch wNAF</Text>
      </>
    ),
  },
  mul_G2: {
    label: (
      <>
        Scalar mult. over <InlineMath math="\mathbb{G}_2" />
      </>
    ),
    description: (
      <>
        Scalar multiplication(s) over <InlineMath math="\mathbb{G}_2" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_2" /> compute{" "}
        <InlineMath math="a_1 P_1, a_2 P_2, \dots, a_n P_n" />
        <br />
        <Text italic> without batch wNAF</Text>
      </>
    ),
  },
  invert: {
    label: (
      <>
        Inversion over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    value: "invert",
    description: (
      <>
        Field inversion(s) over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given field elements{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> compute{" "}
        <InlineMath math="a_1^{-1}, a_2^{-1}, \dots, a_n^{-1}" />
        <br />
        <Text italic> without batch inversion formulae</Text>
      </>
    ),
  },
  add_G1: {
    label: (
      <>
        Addition over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    description: (
      <>
        Elliptic curve <InlineMath math="\mathbb{G}_1" /> additions
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <InlineMath math="\mathbb{G}_1^n \mapsto \mathbb{G}_1: (A_1, A_1, \dots, A_n) \mapsto \sum_i A_i" />
    ),
  },
  add_G2: {
    label: (
      <>
        Addition over <InlineMath math="\mathbb{G}_2" />
      </>
    ),
    description: (
      <>
        Elliptic curve <InlineMath math="\mathbb{G}_2" /> additions
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <InlineMath math="\mathbb{G}_2^n \mapsto \mathbb{G}_2: (A_1, A_1, \dots, A_n) \mapsto \sum_i A_i" />
    ),
  },
  add_Gt: {
    label: (
      <>
        Addition over <InlineMath math="\mathbb{G}_t" />
      </>
    ),
    description: (
      <>
        Elliptic curve <InlineMath math="\mathbb{G}_t" /> additions
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <InlineMath math="\mathbb{G}_2^n \mapsto \mathbb{G}_t: (A_1, A_1, \dots, A_n) \mapsto \sum_i A_i" />
    ),
  },
};

export const operations_selection = Object.keys(operations).map((operation) => {
  return {
    label: operations[operation].label,
    value: operation,
  };
});

export const libraries_selection = Object.fromEntries(Object.keys(curves).map((curve) => [
  curve,
  Object.keys(libraries).map(lib => ({label: libraries[lib].label, key: lib,
      disabled: libraries[lib].disabled || !(lib in estimates[curve]) || false}))
]));

export const machines_selection = Object.fromEntries(
  Object.keys(estimates).map((curve) => [
    curve,
    Object.fromEntries(
      Object.keys(estimates[curve]).map((lib) => [
        lib,
        Object.keys(machines).map((machine) => ({
          label: machines[machine].label,
          key: machine,
          disabled:
            machines[machine].disable ||
            !(machine in estimates[curve][lib]) ||
            false,
        })),
      ])
    ),
  ])
);

export const curves_selection = Object.keys(curves).map(curve => curves[curve]);
