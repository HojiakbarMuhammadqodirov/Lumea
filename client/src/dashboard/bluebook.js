const DIRECTIONS =
  "The questions in this section address a number of important reading and writing skills. " +
  "Each question includes one or more passages, which may include a table or graph. " +
  "Read each passage and question carefully, and then choose the best answer to the question " +
  "based on the passage(s). All questions in this section are multiple-choice with four answer " +
  "choices. Each question has a single best answer.";

function makeTest(num) {
  return {
    id: `bluebook_${num}`,
    num,
    name: `SAT Practice Test ${num}`,
    sections: [
      {
        id: "rw_m1",
        name: "Section 1, Module 1: Reading and Writing",
        directions: DIRECTIONS,
        time: 1920,
        questions: Array.from({ length: 27 }, (_, i) => ({
          id: `bb${num}_rw1_q${i + 1}`,
          passage: `<p style="font-size:15px;line-height:1.78;color:#1a1a1a">question${i + 1}</p>`,
          question: `question${i + 1}`,
          choices: [
            { id: "A", text: "answer1" },
            { id: "B", text: "answer2" },
            { id: "C", text: "answer3" },
            { id: "D", text: "answer4" },
          ],
        })),
      },
    ],
  };
}

export const BLUEBOOK_TESTS = [4, 5, 6, 7, 8, 9, 10, 11].map(makeTest);
