// Test strict grading with a deliberately bad/incomplete answer
import { generateAcademicFeedback } from "./index.js";

const badSubmission = `
Q1: Solve: 2x + 5 = 13
Answer: x = 8

Q2: Find the area of a circle with radius 7cm.
Answer: Area = 22/7 * 7 * 7 = 154
`;

const teacherContext = `
Assignment: Basic Algebra and Geometry Test
Q1: Solve for x: 2x + 5 = 13. Show all working steps. (5 marks)
Q2: Find the area of a circle with radius 7cm. Use π = 22/7. Write the formula, substitute values, and include units. (5 marks)
`;

console.log("Testing strict grading with incomplete student answer...\n");
const result = await generateAcademicFeedback(badSubmission, teacherContext);

console.log("\n=== RESULTS ===");
console.log("Score:", result.data.metrics.accuracyScore, "/ 100");
console.log("\nScoring Breakdown:", result.data._internalDiagnostics?.analysis?.scoringBreakdown);
console.log("\nWhat went well:", result.data.feedback?.whatWentWell);
console.log("\nAreas for improvement:", result.data.feedback?.areasForImprovement);
console.log("\nFeedback Summary:", result.data.feedback?.feedbackSummary);
