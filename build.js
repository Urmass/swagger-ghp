const { Toolkit } = require('actions-toolkit')
const fs   = require('fs');
// Run your GitHub Action!
Toolkit.run(async tools => {
  const pkg = tools.getPackageJSON()
  try {
    const current = pkg.version.toString()
    // set git user
    await tools.runInWorkspace('git', ['config', 'user.name', '"Automated Documentation Build"'])
    await tools.runInWorkspace('git', ['config', 'user.email', '"gh-action-bump-version@users.noreply.github.com"'])

    const currentBranch = /refs\/[a-zA-Z]+\/(.*)/.exec(process.env.GITHUB_REF)[1]
    console.log('currentBranch:', currentBranch)

    await tools.runInWorkspace('git', ['checkout', currentBranch])
    await tools.runInWorkspace('git', ['checkout', 'gh-pages'])
    await tools.runInWorkspace('git', ['rebase', currentBranch])


    await tools.runInWorkspace('mkdir', [current]);
    await tools.runInWorkspace('cp', ['swagger.yml', current])

    let repositoryName = process.env.GITHUB_REPOSITORY.split("/")[1]
    let redirectPath = `/${repositoryName}/${current}/index.html`


    fs.writeFileSync(`${current}/index.html`, swaggerUIHtml);
    fs.writeFileSync('index.html', redirectHtml(redirectPath));
    
    await tools.runInWorkspace('git', ['add', '.'])
    await tools.runInWorkspace('git', ['commit', '-a', '-m', `ci: documentation ${current}`])

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`
    // console.log(Buffer.from(remoteRepo).toString('base64'))
    await tools.runInWorkspace('git', ['push', '--force', remoteRepo, '--follow-tags'])
    await tools.runInWorkspace('git', ['push', remoteRepo, '--tags'])
  } catch (e) {
    tools.log.fatal(e)
    tools.exit.failure('Failed to bump version')
  }
  tools.exit.success('Version bumped!')
})

const swaggerUIHtml = `<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="../dist/swagger-ui.css" >
    <link rel="icon" type="image/png" href="../dist/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="../dist/favicon-16x16.png" sizes="16x16" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>

    <script src="../dist/swagger-ui-bundle.js"> </script>
    <script src="../dist/swagger-ui-standalone-preset.js"> </script>
    <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        url: "swagger.yml",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      })
      // End Swagger UI call region

      window.ui = ui
    }
  </script>
  </body>
</html>`

const redirectHtml = (redirectPath) => `<!DOCTYPE HTML>
    <html lang="en-US">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="0; url=${redirectPath}">
            <script type="text/javascript">
                window.location.href = "${redirectPath}"
            </script>
            <title>Page Redirection</title>
        </head>
        <body>
            If you are not redirected automatically, follow this <a href='${redirectPath}'>link to example</a>.
        </body>
    </html>`;