from cdlib import algorithms
import networkx as nx
import pygraphviz as pgv
import pydot
from neo4j import GraphDatabase
from dotenv import load_dotenv
import os
from flask import Flask, jsonify
from flask import request
from flask_cors import CORS

load_dotenv()

neo4j_uri = os.environ.get('NEO4J_URI')
neo4j_user = os.environ.get('NEO4J_USERNAME')
neo4j_pw = os.environ.get('NEO4J_PASSWORD')

driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_pw))

graph = pydot.Dot('test_graph', graph_type="digraph")


def get_graph(tx):
    query = "MATCH (n) RETURN n"
    result = tx.run(query)
    return result;

with GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_pw)) as driver:
    session = driver.session()
    result = session.read_transaction(get_graph)
    try:
      for record in result:
            node = record["n"]
            graph.add_node(pydot.Node(str(node.id)))
            for neighbor in node.relationships():
              graph.add_edge(pydot.Edge(str(node.id), str(neighbor.end_node.id)))
    except Exception as e:
        print(f"An error occurred: {e}")

graph.write('test.png', 'dot', 'png')

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
    return "<p>Hello, World!</p>"

@app.post("/cluster")
def cluster():
    data = request.data.decode('utf-8')
    print(cluster_graph(data))
    return jsonify(cluster_graph(data))
    

