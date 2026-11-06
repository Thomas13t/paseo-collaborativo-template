# Paseo Collaborative Template · Alpha

A starting point for shared projects: a common repository and shared knowledge, with a local copy and personal agents for each collaborator.

**Invited to a project? Start with [INIZIA-QUI.md](INIZIA-QUI.md).** The linked guides are currently in Italian.

## First time in Paseo: check the plugin

**To use the Invite button, install the plugin on your Paseo daemon.** One installation per computer/daemon is enough, even if you participate in several projects. Cloning or pulling the repository does not install or update the plugin.

Run `node scripts/collab.mjs setup --register`. The `invitationPlugin` output reports whether the button is ready or shows an installation reminder; your agent should report the message to you. This is a setup notice, not a native push notification triggered by cloning.

If the plugin is missing, follow the [installation guide](docs/plugin.md). After consenting to and enabling plugins, run `node scripts/collab.mjs plugin-install`. If it is already active, there is no need to reinstall it. You can work on the repository without the button.

## Create a project

For example, tell your Paseo agent:

> Use the Thomas13t/paseo-collaborativo-template template to create a private project called Sdrubale on my GitHub account. Read its CREA-PROGETTO.md procedure, prepare the local copy, and register it in my Paseo. Then wait for the initial material. Do not invite anyone until I choose the recipient.

The complete procedure is in [CREA-PROGETTO.md](CREA-PROGETTO.md). The template does not require a particular framework or language: projects can contain software, documents, research, or other materials.

## Invite someone

The included plugin adds **Invita al progetto** (Invite to project), with a UserPlus icon, to the header and command menu of collaborative workspaces. It detects the repository from the open project, so you do not have to enter it manually. Check the recipient, repository, and access, then press **Invia invito** (Send invitation). GitHub handles notifications. After accepting, the collaborator can start with INIZIA-QUI.md.

The recipient field accepts a username, a direct GitHub profile link, or a public email address. If GitHub does not expose the email, use the username: the personal-repository collaborators API cannot invite an arbitrary email address. The actual notification address depends on the recipient's GitHub settings. The plugin does not send a personalized message from your email account.

See the [button setup guide](docs/plugin.md). The plugin is optional; the project works without it.

## How we work

- Before starting, refresh the GitHub context and read the [project status](STATO-PROGETTO.md), assignments, and shared decisions.
- Work on separate branches and share progress through pushes and pull requests.
- Each substantial assignment has an objective, an owner, a scope, and completion criteria in its issue; avoid overlapping work unless agreed.
- Keep assumptions, proposals, and approvals distinct in the [decision register](docs/decisioni.md). Respect the user's phase boundaries and pauses.
- Record sources and deliverables, including PDFs and source files, in the [materials index](docs/materiali.md). A file that exists only on one person's computer is not yet shared.
- Each collaborator keeps their own accounts, credentials, conversations, and model preferences.

Shared rules are in [AGENTS.md](AGENTS.md), and the workflow is in [docs/collaborazione.md](docs/collaborazione.md). When creating a project, fill in [docs/progetto.md](docs/progetto.md) and the project status using the actual assignment: the template does not assume a particular methodology or phase.

These are shared conventions for people and agents, not a technical restriction on what a model can do. Summaries should identify missing information and uncertainty.

## Requirements and alpha limitations

Node.js 20+, Git, an authenticated GitHub CLI, and Paseo 0.15.x for the plugin. The plugin's declared range is `>=0.15.0 <0.16.0`; it has been type-checked against the 0.15.0 SDK. Paseo 0.15.2 is the latest stable release checked on 6 November 2026. A live UI and invitation test is still needed to confirm runtime behavior. The template itself uses the Paseo CLI's project, workspace, and script commands. On macOS it also detects the CLI bundled in `/Applications/Paseo.app`; elsewhere use `paseo` on the PATH or set `PASEO_BIN`.

Preparation is an explicit command, not code run automatically on clone. New worktree setup runs checks only. The template does not install providers, change global agent settings, or enable plugins automatically.

The template copies files, not GitHub permissions or protections. The `configure` procedure applies repository settings and can request default-branch protection; if the GitHub plan does not allow it, this is reported explicitly. Agent instructions are working conventions, not a substitute for GitHub permissions and controls.

Future template updates do not automatically propagate to existing projects. Review changes before adopting a new version.

## Verification

`npm test` runs local tests without sending invitations or creating repositories. For the plugin, run `npm ci --ignore-scripts` and `npm run typecheck` in its directory.

Template version: **0.1.0-alpha.1**. Running the plugin requires explicitly enabling plugins on the user's daemon.
