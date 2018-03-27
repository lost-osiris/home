# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi
# Uncomment the following line if you don't like systemctl's auto-paging feature:
# export SYSTEMD_PAGER=

# User specific aliases and functions
function _update_ps1() {
   export PS1="\n$(~/git/powerline-shell/powerline-shell.py $? 2> /dev/null)"
}

#export PROMPT_COMMAND="_update_ps1; $PROMPT_COMMAND"
. /usr/lib/python2.7/site-packages/powerline/bindings/bash/powerline.sh
export TERM=xterm-256color
#alias irssi='TERM=screen-256color irssi'
BASE16_SHELL=$HOME/.config/base16-shell/
[ -n "$PS1" ] && [ -s $BASE16_SHELL/profile_helper.sh ] && eval "$($BASE16_SHELL/profile_helper.sh)"
