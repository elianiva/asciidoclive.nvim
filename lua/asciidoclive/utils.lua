local M = {}

local job_id = nil

M.start_server = function(opts)
  local sourced_file = debug.getinfo(2, "S").source:sub(2)
  local base_directory = vim.fn.fnamemodify(sourced_file, ":h:h:h")
  local cmd = {
    "node",
    base_directory .. "/dist/index.js",
    "index.js",
  }

  local current_ft = vim.bo.filetype
  if current_ft ~= "asciidoc" then
    vim.notify(
      "The current buffer is not an asciidoc file.",
      vim.log.levels.ERROR
    )
    return
  end

  opts = opts or {}

  local options = {
    on_stdout = M.on_stdout,
    on_stderr = M.on_stderr,
    on_exit = M.on_exit,
    cwd = base_directory .. "/app",
    env = {
      ASCIIDOC_LP_ADDRESS = vim.fn.serverstart(),
      ASCIIDOC_LP_PORT = opts.port,
    },
  }

  job_id = vim.fn.jobstart(cmd, options)

  local bufnr = vim.api.nvim_buf_get_number(0)

  vim.api.nvim_buf_attach(bufnr, false, {
    on_lines = function(_, buf)
      M.refresh_content(buf)
    end,
    on_reload = function(_, buf)
      print("buffer: " .. buf)
    end,
  })
end

M.stop_server = function()
  vim.fn.jobstop(job_id)
end

M.refresh_content = function(bufnr)
  if vim.g.asciidoc_lp_chan_id ~= nil then
    vim.fn.rpcnotify(
      vim.g.asciidoc_lp_chan_id,
      "refresh_content",
      { bufnr = bufnr }
    )
  else
    vim.notify("Error starting Asciidoc Live Preview", vim.log.levels.ERROR)
  end
end

M.on_stdout = function() end

M.on_stderr = function(_, data)
  vim.notify(vim.fn.join(data, "\n"), vim.log.levels.ERROR)
end

M.on_exit = function() end

return M
