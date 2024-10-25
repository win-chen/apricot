from cdlib import algorithms
import networkx as nx
import pygraphviz as pgv
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask import request
from flask_cors import CORS

load_dotenv()


# graph.to_string()

def cluster_graph(graph_data):
  # Load the .dot graph
  dot_graph = pgv.AGraph(string=graph_data)
  
  # Convert to a NetworkX graph
  G = nx.DiGraph(dot_graph)

  # Convert to undirected
  G_undirected = G.to_undirected()

  # Use the Louvain method via CDlib
  communities = algorithms.louvain(G_undirected)

  return communities.communities

app = Flask(__name__)

CORS(app,origins='*',  methods=['GET', 'POST', 'PUT', 'DELETE'])

@app.route("/")
def hello_world():
    return "<p>python server up!</p>"

@app.post("/cluster")
def cluster():
    data = request.data.decode('utf-8')
    print(cluster_graph(data))
    return jsonify(cluster_graph(data))
    

