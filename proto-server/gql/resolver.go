package gql

import (
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	Driver neo4j.DriverWithContext
}
