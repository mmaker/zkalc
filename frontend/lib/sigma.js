export const parseLinearCombination = (input) => {
  // Clean up input by removing extra whitespace
  input = input.replace(/\s+/g, ' ').trim();

  // Extract the part between PoK{} if it exists
  const pokMatch = input.match(/PoK\{([^}]+)\}/);
  if (!pokMatch) {
    throw new Error("No PoK{} pattern found");
  }

  const pokContent = pokMatch[1].trim();

  // Split the content by the colon to separate variables from equations
  const colonSplit = pokContent.split(':');
  if (colonSplit.length < 2) {
    throw new Error("Invalid PoK format, missing colon");
  }

  // Extract declared variables
  const variablesPart = colonSplit[0].trim();
  // Extract variables names from the pattern (x, y, z) or similar
  let declaredVariables = [];

  // Match variables inside parentheses
  const variablesMatch = variablesPart.match(/\(([^)]+)\)/);
  if (variablesMatch) {
    // Split by comma and clean up each variable name
    declaredVariables = variablesMatch[1].split(',')
      .map(v => v.trim())
      .filter(v => v !== '');

    // Handle ellipsis in variable declarations like (msg_1, ..., msg_5)
    for (let i = 0; i < declaredVariables.length; i++) {
      if (declaredVariables[i] === '...') {
        // If we find ellipsis, check if we have pattern like msg_1, ..., msg_5
        if (i > 0 && i < declaredVariables.length - 1) {
          const prevVar = declaredVariables[i-1];
          const nextVar = declaredVariables[i+1];

          // Check if variables follow a pattern with numbers
          const prevMatch = prevVar.match(/^(.+?)_(\d+)$/);
          const nextMatch = nextVar.match(/^(.+?)_(\d+)$/);

          if (prevMatch && nextMatch && prevMatch[1] === nextMatch[1]) {
            // We have something like msg_1, ..., msg_5
            const prefix = prevMatch[1];
            const start = parseInt(prevMatch[2], 10);
            const end = parseInt(nextMatch[2], 10);

            // Replace ... with expanded variables
            const expansion = [];
            for (let j = start + 1; j < end; j++) {
              expansion.push(`${prefix}_${j}`);
            }

            // Replace ... with our expansion
            declaredVariables.splice(i, 1, ...expansion);
          }
        }
      }
    }
  }

  // Extract equations part
  const equationsPart = colonSplit.slice(1).join(':').trim();

  // Split into individual equations
  const equations = equationsPart.split(',').map(eq => eq.trim());

  // Results array - will contain count of coefficients for each equation
  const results = [];

  // Process each equation
  for (const equation of equations) {
    // Get the right side of the equation (after =)
    const rightSideMatch = equation.match(/=\s*(.+)$/);
    if (!rightSideMatch) {
      throw new Error(`Invalid equation format: ${equation}`);
    }

    const rightSide = rightSideMatch[1].trim();

    // Handle series notation with ellipsis
    if (rightSide.includes('...')) {
      const seriesMatch = rightSide.match(/(.+?\*.+?)\s*\+\s*\.\.\.\s*\+\s*(.+?\*.+?)$/);
      if (seriesMatch) {
        const firstTerm = seriesMatch[1].trim();
        const lastTerm = seriesMatch[2].trim();

        // Extract the pattern to identify series
        const firstTermMatch = firstTerm.match(/^(.+?)_(\d+)\s*\*\s*.+$/);
        const lastTermMatch = lastTerm.match(/^(.+?)_(\d+)\s*\*\s*.+$/);

        if (firstTermMatch && lastTermMatch && firstTermMatch[1] === lastTermMatch[1]) {
          const startIdx = parseInt(firstTermMatch[2], 10);
          const endIdx = parseInt(lastTermMatch[2], 10);

          // Validate all series variables are declared
          const prefix = firstTermMatch[1];
          for (let i = startIdx; i <= endIdx; i++) {
            const varName = `${prefix}_${i}`;
            if (!declaredVariables.includes(varName)) {
              throw new Error(`Undeclared variable in equation: ${varName}`);
            }
          }

          // Count terms excluding the series (those are separate)
          const seriesTerms = endIdx - startIdx + 1;

          // Count non-series terms and validate them
          const nonSeriesTerms = rightSide
            .replace(seriesMatch[0], '')
            .split('+')
            .filter(term => term.trim() !== '');

          for (const term of nonSeriesTerms) {
            // Extract the scalar (coefficient) from each term
            const scalarMatch = term.trim().match(/^(.+?)\s*\*/);
            if (scalarMatch) {
              const scalar = scalarMatch[1].trim();
              // Check if scalar is declared
              if (!declaredVariables.includes(scalar)) {
                throw new Error(`Undeclared variable in equation: ${scalar}`);
              }
            }
          }

          // Total terms = series terms + other terms
          results.push(seriesTerms + nonSeriesTerms.length);
          continue;
        }
      }
    }

    // Process regular equation (no ellipsis)
    // Split by + to get individual terms
    const terms = rightSide.split('+').map(term => term.trim()).filter(term => term !== '');

    // Validate each term's scalar is declared and count terms
    let validTermsCount = 0;
    for (const term of terms) {
      // Extract the scalar part (before the *)
      const scalarMatch = term.match(/^(.+?)\s*\*/);
      if (scalarMatch) {
        const scalar = scalarMatch[1].trim();
        // Check if this scalar is in the declared variables
        if (!declaredVariables.includes(scalar)) {
          throw new Error(`Undeclared variable in equation: ${scalar}`);
        }
        validTermsCount++;
      }
    }

    results.push(validTermsCount);
  }

  return results;
}