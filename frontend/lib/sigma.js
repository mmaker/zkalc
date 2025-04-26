/**
 * Parser for counting equations and coefficients in linear combination notations
 *
 * Examples:
 * - DL(X) = PoK{(x): X = x * G}
 * - DLEQ(G, H, X, Y) = PoK{(x): X = x * G, Y = x * H}
 * - PEDERSEN(G, H, C) = PoK{(x, r): C = x * G + r * H}
 */

export const parseLinearCombination = (input) => {
    // Clean up input by removing extra whitespace
    input = input.replace(/\s+/g, ' ').trim();

    // Extract the part between PoK{} if it exists
    const pokMatch = input.match(/PoK\{([^}]+)\}/);
    if (!pokMatch) {
      return { num_equations: 0, num_scalars: 0, error: "No PoK{} pattern found" };
    }

    const pokContent = pokMatch[1].trim();

    // Split the content by the colon to separate variables from equations
    const colonSplit = pokContent.split(':');
    if (colonSplit.length < 2) {
      return { num_equations: 0, num_scalars: 0, error: "Invalid PoK format, missing colon" };
    }

    // Extract equations part
    const equationsPart = colonSplit.slice(1).join(':').trim();

    // Count number of equations (separated by commas)
    const equationSplit = equationsPart.split(',').map(eq => eq.trim());
    const num_equations = equationSplit.length;

    // Check for series notation like "msg_1 * J_1 + ... + msg_M * J_M"
    let termsCount = 0;

    // Process each equation to count terms
    for (const equation of equationSplit) {
      if (equation.includes("...")) {
        // This is a series equation

        // Get the part after the equals sign
        const rightSide = equation.split('=')[1]?.trim() || "";

        // Look for the pattern of a series with ellipsis
        const seriesMatch = rightSide.match(/msg_(\d+) \* J_\1 \+ \.\.\. \+ msg_(\d+) \* J_\2/);

        if (seriesMatch) {
          // We have a series like msg_1 * J_1 + ... + msg_5 * J_5
          const startNum = parseInt(seriesMatch[1], 10);
          const endNum = parseInt(seriesMatch[2], 10);

          // If we have a valid range, count the terms
          if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) {
            // Count the total number of terms in the series
            const seriesTerms = endNum - startNum + 1;

            // Count additional terms outside the series pattern (like secret_prover_blind * Q_2)
            const otherTerms = rightSide
              .replace(seriesMatch[0], "") // Remove the series
              .split('+')
              .filter(term => term.includes('*') && term.trim() !== "")
              .length;

            termsCount = Math.max(termsCount, seriesTerms + otherTerms);
          } else {
            // If we can't parse the range, count the visible terms
            termsCount = Math.max(termsCount, countVisibleTerms(rightSide));
          }
        } else if (rightSide.includes("...")) {
          // Handle imprecise series (might indicate M terms)
          // Extract the last term in the series to find M
          const lastTermMatch = rightSide.match(/\+ ([^+]+)$/);
          if (lastTermMatch) {
            const lastTerm = lastTermMatch[1].trim();
            // Check if we can determine M from the last term (e.g., msg_M * J_M)
            const mMatch = lastTerm.match(/msg_(\d+)/);
            if (mMatch) {
              const M = parseInt(mMatch[1], 10);
              if (!isNaN(M)) {
                // If we found a number, use it as our count
                // Count additional terms outside the series
                const otherTerms = rightSide
                  .split('+')
                  .filter(term => !term.includes("...") && term.includes('*') && !term.includes(`msg_${M}`))
                  .length;

                termsCount = Math.max(termsCount, M + otherTerms);
              }
            } else {
              // Can't determine exact count, just count visible terms
              termsCount = Math.max(termsCount, countVisibleTerms(rightSide));
            }
          }
        } else {
          // Just count the terms normally
          termsCount = Math.max(termsCount, countVisibleTerms(rightSide));
        }
      } else {
        // Regular equation without ellipsis
        const rightSide = equation.split('=')[1]?.trim() || "";
        termsCount = Math.max(termsCount, countVisibleTerms(rightSide));
      }
    }

    return { num_equations, num_scalars: termsCount};
  }

  // Helper function to count visible terms in an expression
  function countVisibleTerms(expression) {
    if (!expression) return 0;

    return expression
      .split('+')
      .filter(term => term.includes('*') && term.trim() !== "")
      .length;
  }

