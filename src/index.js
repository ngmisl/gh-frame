const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const Handlebars = require('handlebars');

async function run() {
    try {
        const cname = core.getInput('cname');
        const token = core.getInput('token') || process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(token);
        const context = github.context;

        // Get repository information
        const { owner, repo } = context.repo;
        
        // Get repository and owner details
        const [repoData, userData] = await Promise.all([
            octokit.rest.repos.get({
                owner,
                repo
            }),
            octokit.rest.users.getByUsername({
                username: owner
            })
        ]);

        // Create a simple OG image URL with repository info
        const title = encodeURIComponent(repoData.data.name);
        const description = repoData.data.description ? 
            encodeURIComponent(repoData.data.description.slice(0, 100)) : '';
        const username = encodeURIComponent(`@${userData.data.login}`);
        
        // Create a 1200x800 image (3:2 ratio) with text
        const ogImageUrl = `https://placehold.co/1200x800/f5f0ec/222222/png?text=${title}%0A${description}%0A${username}`;
        
        // Create a 200x200 splash image
        const splashImageUrl = `https://placehold.co/200x200/f5f0ec/222222/png?text=${title}`;

        // Read README.md
        const readmePath = path.join(process.env.GITHUB_WORKSPACE, 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf8');

        // Convert markdown to HTML
        const htmlContent = marked(readmeContent);

        // Read and compile template
        const templatePath = path.join(__dirname, 'template.html');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateContent);

        // Generate the site URL
        const siteUrl = cname ? `https://${cname}` : `https://${owner}.github.io/${repo}`;

        // Generate final HTML
        const finalHtml = template({
            title: repoData.data.name,
            description: repoData.data.description || '',
            content: htmlContent,
            currentUrl: siteUrl,
            ogImageUrl: ogImageUrl,
            splashImageUrl: splashImageUrl
        });

        // Create or update gh-frame branch
        const branchName = 'gh-frame';
        let branchRef;

        try {
            // Try to get the branch
            const { data: ref } = await octokit.rest.git.getRef({
                owner,
                repo,
                ref: `heads/${branchName}`
            });
            branchRef = ref;
        } catch (error) {
            if (error.status === 404) {
                // Branch doesn't exist, create it
                const { data: mainBranch } = await octokit.rest.git.getRef({
                    owner,
                    repo,
                    ref: 'heads/main'
                });

                await octokit.rest.git.createRef({
                    owner,
                    repo,
                    ref: `refs/heads/${branchName}`,
                    sha: mainBranch.object.sha
                });
            } else {
                throw error;
            }
        }

        // Create or update files
        const files = {
            'index.html': finalHtml,
            'styles.css': fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8')
        };

        if (cname) {
            files['CNAME'] = cname;
        }

        // Create a tree with the new files
        const treeItems = Object.entries(files).map(([path, content]) => ({
            path,
            mode: '100644',
            type: 'blob',
            content
        }));

        const { data: tree } = await octokit.rest.git.createTree({
            owner,
            repo,
            tree: treeItems,
            base_tree: branchRef ? branchRef.object.sha : undefined
        });

        // Create a commit
        const { data: commit } = await octokit.rest.git.createCommit({
            owner,
            repo,
            message: 'Update static page',
            tree: tree.sha,
            parents: branchRef ? [branchRef.object.sha] : []
        });

        // Update the branch reference
        await octokit.rest.git.updateRef({
            owner,
            repo,
            ref: `heads/${branchName}`,
            sha: commit.sha,
            force: true
        });

        core.info('Static page updated successfully!');
        core.info(`\nTo complete setup (one-time step):
1. Go to your repository's Settings
2. Navigate to Pages (in the left sidebar)
3. Under "Branch", select "gh-frame"
4. Click Save

Your page will be available at: ${siteUrl}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run(); 