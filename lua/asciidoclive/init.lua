local utils = require "asciidoclive.utils"
local M = {}

M.setup = function(opts)
  opts = opts or {}

  if opts.port ~= nil then
    vim.g.asciidoc_lp_port = opts.port
  end

  if opts.css ~= nil then
    vim.g.asciidoc_lp_css_path = vim.fn.expand(opts.css)
  end

  vim.api.nvim_add_user_command("AsciidocLivePreviewStart", function()
    utils.start_server(opts)
  end, {})

  vim.api.nvim_add_user_command("AsciidocLivePreviewStop", function()
    utils.stop_server()
  end, {})

  vim.cmd [[
    augroup AsciiDocLivePreview
      au!
      au VimLeavePre * AsciidocLivePreviewStop
    augroup END
  ]]
end

return M
