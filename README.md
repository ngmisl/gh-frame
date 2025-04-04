# gh-frame

A GitHub Action that creates a Farcaster-friendly static page from your README.md with automatic frame support.

## Features

- Converts your README.md to a beautiful static page
- Automatically generates Open Graph images for social sharing
- Creates a Farcaster frame mini-app for your repository
- Supports custom domain names
- Rewrites relative image links to use raw.githubusercontent.com URLs
- Mobile-friendly design
- Dark mode support

## Usage

1. Create a new workflow file in your repository at `.github/workflows/gh-frame.yml`:

```yaml
name: Build Farcaster Page
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: vrypan/gh-frame@v1.1.10
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

2. Go to your repository's Settings > Pages and:
   - Select the `gh-frame` branch as the source
   - Click Save

Your page will be available at:
- `https://<username>.github.io/<repository>`
- Or at your custom domain if configured

## Frame Mini-App

The generated page includes a Farcaster frame mini-app that allows users to:
- View your repository directly in Farcaster
- Interact with links in your README
- Share your repository in Farcaster feeds

The frame includes:
- A custom splash screen with your repository's image
- A button to open the repository
- Automatic link handling for external URLs

## Customization

### Images

The action automatically generates two images:
- `og-image.png`: Used for social sharing and the frame
- `splash-image.png`: Used for the frame splash screen

You can customize these images by:
1. Creating a `generate-images.sh` script in your repository
2. The script should generate both images in the current directory

### Styling

The page uses a clean, modern design with:
- Responsive layout
- Dark mode support
- GitHub-like styling
- Custom fonts and colors


## Development

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Test locally
npm test
```

## License

MIT

# Test GFM Features

## Code Blocks
```python
def hello_world():
    print("Hello, World!")
```

## Tables
| Feature | Support |
|---------|---------|
| Tables  | ✅      |
| Code    | ✅      |
| Lists   | ✅      |

## Lists
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2

1. Numbered item 1
2. Numbered item 2

## Task Lists
- [x] Task 1
- [ ] Task 2
- [ ] Task 3

## Strikethrough
~~This text is strikethrough~~

## Emoji
:smile: :rocket: :tada:

## Links
[GitHub](https://github.com)

## Images
![Test Image](./images/test.png)
![External Image](https://example.com/image.png)

## Blockquotes
> This is a blockquote
> 
> With multiple lines

## Inline Code
This is `inline code` in a sentence.

## Syntax Highlighting
```javascript
const greeting = "Hello, World!";
console.log(greeting);
```

## Footnotes
Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.
