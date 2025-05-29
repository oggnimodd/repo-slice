# File Refinement Feature Plan for repo-slice CLI

## Overall Flow (Re-architected):

1.  The user provides an initial prompt.
2.  The system uses `buildPrompt` to create the initial AI prompt.
3.  The AI identifies relevant files based on the initial prompt.
4.  The initial list of relevant files is displayed to the user.
5.  A new prompt asks the user if they want to refine the list and, if so, to provide their comments in natural language.
6.  If comments are provided, the system uses `buildRefinementPrompt` (a *new* function) to create a *second* AI prompt. This prompt will explicitly incorporate the original user prompt, the initial AI-identified files, and the user's refinement comments.
7.  A second AI call will be made using this refinement prompt to generate a *refined* list of files.
8.  The refined list will then be used for the subsequent copy operations.

## Detailed Plan (Revised):

**Goal 1: Introduce a new prompt for user comments in `lib/cli.ts`**
*   After the initial AI response (`aiResponse`) is received and `relevantFiles` are displayed, add a new `inquirer.prompt` to ask the user if they want to refine the file list and, if so, to input their comments.
*   Store these comments in a variable.

**Goal 2: Create a new AI function for file list refinement in `lib/ai.ts`**
*   Define a new asynchronous function, e.g., `refineRelevantFiles`, that will take the `userPrompt` (original), the `initialRelevantFiles` (as identified by the first AI call), the `userComments`, the `tree` structure, and the `concatenatedContent` as arguments.
*   This function will call the *new* `buildRefinementPrompt` function (from `lib/prompt.ts`) to construct the specific prompt for the AI to refine the file list based on the user's comments.
*   It will then call the AI model (`generateObject`) with this new prompt and the `relevantFilesSchema` to get the refined list.
*   The function will return the `relevant_files` array from the AI's response.

**Goal 3: Create a dedicated refinement prompt builder in `lib/prompt.ts`**
*   Create a *new* function, `buildRefinementPrompt`, that accepts `originalUserRequest`, `initialRelevantFiles`, `userComments`, `tree`, and `concatenatedContent`.
*   This function will generate a comprehensive prompt for the AI. This prompt should:
    *   Clearly state the `originalUserRequest`.
    *   Present the `initialRelevantFiles` identified by the AI.
    *   Clearly state the `userComments` and instruct the AI to interpret them (e.g., "exclude files/folders mentioned," "include files/folders mentioned").
    *   Provide the `File Tree Structure` and `File Contents` for context, similar to the initial prompt.
    *   Emphasize the critical analysis guidelines for file selection, ensuring the AI adheres to existing file paths and relevance.

**Goal 4: Integrate the refinement process into `lib/cli.ts`**
*   If the user provides comments for refinement, call the newly created `refineRelevantFiles` function (from `lib/ai.ts`) with the necessary arguments.
*   Update the `relevantFiles` variable with the result of this refinement.
*   Display the `refinedRelevantFiles` to the user.
*   The subsequent `copyAnswers` prompt will then operate on this refined `relevantFiles` array.

## Mermaid Diagram of the Proposed Flow (Revised):

```mermaid
graph TD
    A[Start repo-slice CLI] --> B{User enters initial prompt?};
    B -- Yes --> C[Get Tree Structure & Concatenated Content];
    C --> D[Build Initial AI Prompt (buildPrompt)];
    D --> E[Call AI (callAI) for Initial Relevant Files];
    E --> F[Display Initial Relevant Files];
    F --> G{Ask User for Refinement Comments?};
    G -- Yes --> H[Get User Comments];
    H --> I[Build Refinement AI Prompt (buildRefinementPrompt)];
    I --> J[Call AI (refineRelevantFiles) for Refined Relevant Files];
    J --> K[Display Refined Relevant Files];
    G -- No --> L[Present Copy Options (inquirer.prompt)];
    K --> L;
    L --> M[Execute Copy Action (copy.ts functions)];
    M --> N[End];