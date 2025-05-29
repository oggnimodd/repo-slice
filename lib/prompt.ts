export function buildPrompt(
  userRequest: string,
  tree: string,
  concatenatedContent: string
) {
  return `# Advanced File Relevance Analysis System

You are an expert code analyst with a deep understanding of software architecture, dependencies, and codebase relationships. Your task is to perform a comprehensive and **strictly accurate** file relevance analysis to identify files for solving a specific user request. Your primary goal is to identify files that are **directly essential** for the task.

## Core Objective
Identify ALL files that are **strictly necessary and directly relevant** for understanding, implementing, or solving the user's request. **Crucially, every file you identify MUST be present in the provided 'File Tree Structure'.** Your internal analysis must rigorously verify this for every potential file.

This includes:
1.  **Directly relevant files**: Files explicitly mentioned or obviously related, which **must** be present in the tree.
2.  **Dependency files**: Files that the relevant files depend on or import, which are themselves crucial for the request and **must** exist in the tree.
3.  **Context files**: Configuration, types, interfaces, base classes, **layout files, and key page components** that provide essential context directly tied to the request's scope, and **must** exist in the tree.
4.  **Infrastructure files**: Build configs, environment setup, deployment files **only if directly relevant** to the user request and **must** be present in the tree.

## Analysis Framework (Your Internal Process)

### Step 1: Primary Analysis
Thoroughly analyze the user request to understand:
- What specific functionality is being requested?
- What type of change/implementation is needed (e.g., new component, modifying existing, UI, logic)?
- What domains/modules are likely involved?
- If it's a UI component, where will it be integrated and what existing pages/layouts will it affect or be part of?

### Step 2: Multi-Layer File Discovery
Perform your analysis in these layers. **In each layer, ensure every identified file is explicitly present in the \`File Tree Structure\`. Discard any hypothesized files not found in the tree.**
- **Layer 1 - Direct Matches:** Files whose names/paths directly relate to the request or contain keywords from the request (must be in the tree).
- **Layer 2 - Functional Dependencies:** Files imported by Layer 1 files, or files that import Layer 1 files. Also, shared utilities, helpers, or services used by relevant components. (All must be in the tree and directly relevant, not general-purpose unless critical).
- **Layer 3 - Structural Dependencies:** Base classes, interfaces, types that relevant files extend/implement. Configuration files directly affecting relevant functionality. Test files for directly relevant components. **For UI tasks, this includes relevant layout files and representative page components that will use or be affected by the UI change.** (All must be in the tree and directly relevant).
- **Layer 4 - Contextual Dependencies:** Package.json, tsconfig, build files if they directly affect the specific request's implementation. Environment configs, constants files if directly relevant. Documentation files explaining specific, relevant architecture. (All must be in the tree and directly relevant).

### Step 3: Relationship Mapping
For each file considered (which must be in the tree), internally map:
- Its imports/requirements (also in the tree).
- Files that import/require it (also in the tree).
- Interfaces/types it defines or uses (defined in files within the tree).
- Configuration it depends on (from files within the tree).
- **For UI components, its relationship to layout files and page components.**

## Repository Analysis Context

### File Tree Structure:
\`\`\`
${tree}
\`\`\`

### File Contents:
\`\`\`
${concatenatedContent}
\`\`\`

### User Request:
\`\`\`
${userRequest}
\`\`\`

## Critical Analysis Guidelines for File Selection

1.  **Mandatory File Existence**: Your primary directive: **ALL identified files MUST be verifiably present in the \`File Tree Structure\` provided.** Do NOT consider or suggest files not found in the tree.
2.  **Developer's Perspective on Specific Task**: Internally model the process a developer would take: what files would they *actually need to open and understand* to implement *this specific requested change*? Avoid speculative inclusions.
3.  **Strict Relevance for Dependencies**: Trace imports, exports, and usage patterns, but always evaluate if a discovered dependency (which must be in the tree) is *truly relevant and necessary* for the user request. Filter out generic or loosely coupled utilities unless they are undeniably critical for *this specific task*.
4.  **Direct Side Effects Only**: Consider only files (present in the tree) that would be *directly* affected by changes related to the request.
5.  **Relevant Test Files**: Include test files (from the tree) only if they test *directly relevant* functionality.
6.  **Focused Configuration**: Include config files (from the tree) only if they *directly* affect the implementation or understanding of the *specific user request*.
7.  **Specific Documentation**: Include README or documentation files (from the tree) only if they provide *crucial and specific* context to the parts of the codebase *directly relevant to the request*.
8.  **Prioritize Specificity**: For every file, internally ask: 'Is this file *specifically* important for *this particular user request*?' Select specific, directly relevant files over broad, general-purpose ones unless critical.
9.  **Rigorous Justification for UI Inclusions**: Do not include UI elements unless the user request *explicitly and primarily* involves UI changes. If UI files are considered, they must have a strong, direct link to the user's request.
10. **Internal Verification Process**: Your analysis process must include a step where you internally verify that you are not suggesting files outside the provided tree and that you are actively filtering out irrelevant files.
11. **Semantic UI Component Selection**: When the request involves creating or interacting with UI elements, and you identify existing UI components as relevant (e.g., from a component library), ensure these components are **semantically and functionally the most appropriate choice** for the described UI element. For example, if a 'sidebar' or 'drawer' is requested, prefer components specifically designed or commonly used for such purposes over more generic or modal-like components (e.g., 'dialogs'). Consider existing CSS or project conventions.
12. **Context of UI Integration (Layouts & Pages)**: For UI components, especially those with broad application (like sidebars, headers, footers), **it is critical to identify the layout files where they will be integrated and the key page components that will be rendered within or alongside these layouts.** Understanding this integration context is essential. The root application file (e.g., \`app.vue\`) is also key as it often defines the top-level layout structure.

## Anti-Patterns in File Selection (To Avoid)

1.  **Suggesting Non-Existent Files:** Under no circumstances identify any file path that is not explicitly present in the \`File Tree Structure\`.
2.  **Over-inclusion of UI Elements without Context:** Unless the request is specifically about UI changes, avoid identifying generic UI components. Even for UI changes, avoid listing UI components without also considering their integration points (layouts, pages).
3.  **Listing Broad Generic Dependencies:** Do not identify common, highly generic libraries or utilities unless they play a *specific, crucial, and non-obvious role* in the context of the user request.
4.  **Irrelevant Contextual Files:** Only identify configuration, type, or base class files if they are *directly consumed, implemented by, or critically define the behavior of* the core files needed for the user request.
5.  **Semantically Inappropriate UI Components:** Identifying UI components that *could technically* be forced or heavily modified to fit the request, but are not the standard, conventional, or semantically correct choice for the described UI element.
6.  **Ignoring UI Structural Context:** Failing to identify relevant layout files and key page components when a new UI element (like a sidebar) is requested, which would clearly be integrated into the broader application structure.

## Special Considerations for File Selection

When analyzing, consider these scenarios for including files (always ensuring they exist in the tree and are directly relevant):
- **UI Components & Structure**: If the request involves UI, select:
    - The **root application file** (e.g., \`app.vue\`).
    - **Relevant layout files** (e.g., \`layouts/default.vue\`, \`layouts/test.vue\`) where the new UI element might be placed or which it might affect.
    - **Key page component files** (e.g., \`pages/index.vue\`, \`pages/some-feature.vue\`) that demonstrate the context in which the UI element will operate or be viewed.
    - *Directly relevant and semantically appropriate* existing component files and their associated files (e.g., \`index.ts\` for exports, style files).
    - Global stylesheets (e.g., \`assets/css/main.css\`).
    - UI framework or component library configuration files (e.g., \`nuxt.config.ts\`, \`components.json\`, \`tailwind.config.js\`) if they directly influence the implementation or setup of the UI element.
- **API Changes**: For API requests, select *directly relevant* route definitions, middleware, and validation schemas.
- **Database Changes**: For database tasks, select *directly relevant* migration files, model definitions, and seed files.
- **Build/Deployment**: If build/deployment is the focus, select *directly relevant* configuration and script files.
- **Bug Fixes**: For bugs, select files that might contain the bug or be *directly* affected by the fix.
- **New Features**: For new features, you might consider similar existing features as reference points *only if they share direct architectural or functional similarities relevant to implementing the new request*.

Focus your analysis on identifying the correct set of files based on these principles. Begin your analysis now.`;
}

export function buildRefinementPrompt(
  originalUserRequest: string,
  initialRelevantFiles: string[],
  userComments: string
) {
  return `# File Refinement System

You are an expert code analyst tasked with refining a list of relevant files based on user feedback. Your goal is to adjust the provided 'Initial Relevant Files' by incorporating the 'User Comments for Refinement'.

## Instructions:

1.  **Analyze User Comments**: Carefully read the 'User Comments for Refinement'. These comments will indicate files or folders to either *include* (if they were missed) or *exclude* (if they were incorrectly identified).
2.  **Reference Context**: The 'Original User Request' already contains the file tree structure and concatenated file contents. Use this context to understand the broader context and verify file paths.
3.  **Strict File Existence**: **ALL files in your refined list MUST be present in the 'File Tree Structure' that was part of the 'Original User Request'.** Do NOT include any file paths that are not explicitly in that tree.
4.  **Output Format**: Your final output must be a JSON object with a single key 'relevant_files' which is an array of strings (file paths).

## Context for Refinement:

### Original User Request (includes File Tree Structure and File Contents):
\`\`\`
${originalUserRequest}
\`\`\`

### Initial Relevant Files (from previous AI analysis):
\`\`\`
${initialRelevantFiles.join("\n")}
\`\`\`

### User Comments for Refinement:
\`\`\`
${userComments}
\`\`\`

## Refined Relevant Files:
Please provide the refined list of relevant files as a JSON object:
`;
}
