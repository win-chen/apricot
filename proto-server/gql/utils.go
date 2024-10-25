package gql

import (
	"errors"
	"fmt"
	"proto-server/gql/model"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j/db"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j/dbtype"
)

func nodeFromRecord(record *db.Record) (*model.Node, error) {
	value, ok := record.Get("n")
	if !ok {
		return nil, errors.New("missing node in response")
	}

	node, ok := value.(neo4j.Node)
	if !ok {
		return nil, errors.New("result not parseable to Node")
	}

	response := dbNodeToModel(node)

	return response, nil
}

func nodesFromRecord(record *db.Record) ([]*model.Node, error) {
	value, ok := record.Get("nodes")
	if !ok {
		return nil, errors.New("missing nodes in record")
	}

	list, ok := value.([]interface{})
	if !ok {
		return nil, errors.New("unexpected type for nodes in record")
	}

	var nodes []*model.Node
	for _, node := range list {
		if node != nil {
			nodes = append(nodes, dbNodeToModel(node.(neo4j.Node)))
		}
	}
	return nodes, nil
}

func edgeFromRecord(record *db.Record) (*model.Edge, error) {
	value, ok := record.Get("edge")
	if !ok {
		return nil, errors.New("missing edge in response")
	}

	// TODO: replace with stronger type
	edge, ok := value.(map[string]interface{})
	if !ok {
		return nil, errors.New("result not parseable to Edge")
	}

	return dbEdgeToModel(edge), nil
}

func dbNodeToModel(node dbtype.Node) *model.Node {
	props := node.GetProperties()

	return &model.Node{
		ID:   props["id"].(string),
		Text: props["text"].(string),
		X:    props["x"].(float64),
		Y:    props["y"].(float64),
	}
}

func dbEdgeToModel(props map[string]interface{}) *model.Edge {
	return &model.Edge{
		Label:  props["label"].(string),
		Source: props["source"].(string),
		Target: props["target"].(string),
	}
}

func edgesFromRecord(record *db.Record) ([]*model.Edge, error) {
	value, ok := record.Get("edges")
	if !ok {
		return nil, errors.New("missing edges in record")
	}

	list, ok := value.([]interface{})
	fmt.Println(list)
	if !ok {
		return nil, errors.New("unexpected type for edges in record")
	}

	var edges []*model.Edge
	for _, edge := range list {
		if edge != nil {
			props := edge.(map[string]interface{})

			edges = append(edges, dbEdgeToModel(props))
		}
	}
	return edges, nil
}
