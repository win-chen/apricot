Poetry stuff still doesn't work :/
pygraphviz does not install properly using poetry add

# if you have trouble installing graphviz for pygraphviz

brew install graphviz
python -m pip install \
 --global-option=build_ext \
 --global-option="-I$(brew --prefix graphviz)/include/" \
    --global-option="-L$(brew --prefix graphviz)/lib/" \
 pygraphviz

flask --app main run
