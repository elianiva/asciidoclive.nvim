# asciidoclive.nvim
> NOTE: I made this just for fun so I probably won't maintain it long term :p

An asciidoc live previewer for Neovim. Only works on recent Neovim version
because it uses a relatively new `nvim_add_user_command` API

## Features
- Live preview on each keystroke
- Pretty stylings using [sakura.css](https://github.com/oxalorg/sakura)
- honestly that's it

## Requirements
- Neovim after [this commit](https://github.com/neovim/neovim/commit/eff11b3c3fcb9aa777deafb0a33b1523aa05b603)
- Node JS >= 12
- Neovim [node-client](https://github.com/neovim/node-client)

## Installation
i use packer so..

```lua
{
  "elianiva/asciidoclive.nvim",
  run = "cd ./app && npm ci", -- install node dependencies
  config = function()
    -- these are the default values
    require("asciidoclive").setup {
      port = 3000, -- server port
      host = "127.0.0.1" -- server host
      css  = "" -- path to custom css file, must be a local file
    }
  end
}
```

## Usage
This plugin provides two commands:

- `AsciidocLivePreviewStart`
- `AsciidocLivePreviewStop`

They does exactly what they are.

## Limitations
Some stuff could be improved, here's a temporary list which will probably get
updated in the future.

- [ ] automatically open the browser
- [ ] asciidoctor.js seems to remove the first heading.. idk if that's intended or not
- [ ] Add option to refresh on save
- [ ] Debounce keystroke?
- [ ] Send the entire buffer content on initial connection
- [ ] No live scrolling
- [ ] Only works on the buffer where you start the previewer

    Currently it behaves like this because I use `nvim_buf_attach` upon
    starting the server and it only listens to the current buffer. It
    should probably listen to any buffer with the same filename, but eh, it
    fits my need atm
- [ ] TBD

PR's welcome, btw.

## Acknowledgement
- [iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
  `asciidoclive.nvim` is basically a (very) dumbed down version of this.

---

If you found any issue / something missing, just open an issue (or better, make a PR :)
