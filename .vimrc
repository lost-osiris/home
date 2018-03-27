autocmd! bufwritepost .vimrc source %
set bs=2
set pastetoggle=<F2>
set nowritebackup

" Bind nohl
let mapleader = ","
noremap <C-n> :nohl<CR>
vnoremap <C-n> :nohl<CR>
inoremap <C-n> :nohl<CR>

silent! nmap <Leader>f <esc>:NERDTreeToggle<CR>
map cc <Nop>
map S <Nop>
map C <Nop>

" bind Ctrl+<movement> keys to move around the windows, instead of using Ctrl+w + <movement>
" Every unnecessary keystroke that can be saved is good for your health :)
map <c-j> <c-w>j
map <c-k> <c-w>k
map <c-l> <c-w>l
map <c-h> <c-w>h

" easier moving between tabs
map <Leader>q <esc>:tabprevious<CR>
map <Leader>e <esc>:tabnext<CR>
map <Leader>t <esc>:tabnew<CR>

" Quicksave command
map <Leader>s <esc>:update<CR>

" Quick quit command
noremap <Leader>1 :quit<CR>  " Quit current window
noremap <Leader>2 :qa!<CR>


" Color scheme
set background=dark
colorscheme solarized
"highlight Normal ctermbg=none

" Enable syntax highlighting
" You need to reload this file for the change to apply
syntax on

" Showing line numbers and length
" set number  " show line numbers
" set tw=79   " width of document (used by gd)
set nowrap  " don't automatically wrap on load
set fo-=t   " don't automatically wrap text when typing
" highlight ColorColumn ctermbg=233


" Disable stupid backup and swap files - they trigger too many events
" for file system watchers
" set nobackup
" set nowritebackup
" set noswapfile

" Setup Pathogen to manage your plugins
" mkdir -p ~/.vim/autoload ~/.vim/bundle
" curl -so ~/.vim/autoload/pathogen.vim https://raw.github.com/tpope/vim-pathogen/HEAD/autoload/pathogen.vim
"Now you can install any plugin into a .vim/bundle/plugin-name/ folder
set rtp+=~/.vim/bundle/Vundle.vim
set nocompatible
filetype off
call vundle#begin()

Plugin 'gmarik/Vundle.vim'
Plugin 'Valloric/YouCompleteMe'
Plugin 'scrooloose/syntastic'
Plugin 'scrooloose/nerdtree'
Plugin 'altercation/vim-colors-solarized'
"Plugin 'scrooloose/nerdcommenter'
Plugin 'tomtom/tcomment_vim'
"Plugin 'tpope/vim-commentary'
Plugin 'jistr/vim-nerdtree-tabs'
Plugin 'myint/syntastic-extras'
Plugin 'hdima/python-syntax'
"Plugin 'nathanaelkane/vim-indent-guides'
Plugin 'christoomey/vim-tmux-navigator'
" Plugin 'leafgarland/typescript-vim'
Plugin 'HerringtonDarkholme/yats.vim'
" Plugin 'pangloss/vim-javascript'
Plugin 'mxw/vim-jsx'
Plugin 'chriskempson/base16-vim'
Plugin 'othree/yajs.vim'

call vundle#end()
filetype plugin on
filetype plugin indent off

" used for python version of powerline
set rtp+=/usr/lib/python2.7/site-packages/powerline/bindings/vim/

let g:Powerline_symbols = 'fancy'
set laststatus=2
set t_Co=256
" Settings for vim-powerline

set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*

let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0
let g:syntastic_python_python_exec = '/usr/bin/python3.5'
let g:syntastic_python_checkers = ['pyflakes_with_warnings']
let g:syntastic_javascript_checkers = ['json_tool']

let python_highlight_all = 1
let g:tcommentMapLeaderOp1 = "."
"autocmd CursorMovedI * if pumvisible() == 0|pclose|endif
"autocmd InsertLeave * if pumvisible() == 0|pclose|endif
" Real programmers don't use TABs but spaces
set tabstop=3
"set softtabstop=3
set shiftwidth=3
"set shiftround
set expandtab
" easier moving of code blocks
" Try to go into visual mode (v), thenselect several lines of code here and
" then press ``>`` several times.
vnoremap < <gv  " better indentation
vnoremap > >gv  " better indentation
let g:NERDTreeMapActivateNode="<F6>"
let g:NERDTreeMapPreview="<F5>"

if !exists("g:ycm_semantic_triggers")
  let g:ycm_semantic_triggers = {}
endif
let g:ycm_semantic_triggers['typescript'] = ['.']
let g:jsx_ext_required = 0
"
if filereadable(expand("~/.vimrc_background"))
  let base16colorspace=256
  source ~/.vimrc_background
endif
