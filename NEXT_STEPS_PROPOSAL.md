# Proposal for Next Steps

This document outlines the immediate next steps for development and a longer-term strategy for implementing the full suite of specialized agents.

---

### Part 1: Immediate Next Steps (Stabilizing the Foundation)

Before we build out the full roster of specialized agents, it's crucial to make the core system more robust and fully-featured. The work we just did was like laying the foundation and framing a house; now we need to put in the electrical and plumbing before we start decorating the rooms.

Here are the three most critical steps to take next:

1.  **Full Database Implementation & CRUD Endpoints:**
    *   **What:** Our API can create tasks, but it's missing the ability to easily manage all the data. I will build the full suite of CRUD (Create, Read, Update, Delete) API endpoints for all our core models, like Data Rooms, Documents, and past Workflow results.
    *   **Why:** This is essential for a fully functional application. The user needs to be able to manage their data rooms, see past workflow results, and inspect agent executions.

2.  **Refine the Orchestrator with State Management:**
    *   **What:** The current orchestrator passes information between agents in a simple way. I will upgrade this to a proper state management system where the output of each agent step is saved to the database (e.g., in an `AgentExecution` table). The next agent in the DAG can then reliably retrieve the input it needs from the database.
    *   **Why:** This makes the entire workflow engine much more reliable and resilient. If a long workflow fails halfway through, we can inspect the state of each step and resume it without starting over. It's crucial for reliability.

3.  **Implement the "Human-in-the-Loop" Approval Flow:**
    *   **What:** This is a core part of your vision. I will implement the full loop where the Orchestrator generates a plan, the workflow is paused with a `pending_approval` status, and the frontend displays that plan to the user with "Approve" or "Reject" buttons.
    *   **Why:** This provides the essential user control and transparency that makes Guild unique. It's a critical feature to have in place before we add more complex and autonomous agents.

---

### Part 2: Strategy for Building the Full Agent Workforce

The most appropriate and efficient time to begin implementing the large list of specialized agents is **immediately after these three foundational steps are complete.**

Once the core system is stable, reliable, and has the human approval loop in place, we can then rapidly and confidently add new agents. Each new agent will be like a "plug-in" to a solid platform.

I recommend a phased approach, grouping them by **core business capability**:

*   **Phase 1: Marketing & Growth:** We would focus on building out the full suite of marketing agents (`Content Strategist`, `SEO Agent`, `Paid Ads Agent`, `PR Agent`, etc.). This would create a complete, valuable "Marketing Department in a Box."
*   **Phase 2: Sales & Revenue:** Once marketing is generating leads, we would build the agents to handle them (`Sales Funnel Agent`, `CRM Agent`, `Outbound Sales Agent`).
*   **Phase 3: Operations & Finance:** Finally, we would build the agents that handle the internal business processes.

This iterative approach allows us to deliver significant, focused value at each stage and ensures each "department" of the AI company is fully functional before we move to the next.
