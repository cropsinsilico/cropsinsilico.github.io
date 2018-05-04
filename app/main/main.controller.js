/* global angular:false */

angular.module('cis')

/** Constants for the keys to store our localStorage data */
.constant('LocalStorageKeys', { edges: 'cis::edges', nodes: 'cis::nodes' })

/** Our main view controller */
.controller('MainCtrl', [ '$scope', '$window', '$timeout', '$q', '$http', '$log', '$uibModal', '_', 'DEBUG', 'TheGraph', 'Links', 'Nodes', 'Models', 'CisApi', 'LocalStorageKeys', 'TheGraphSelection',
    function($scope, $window, $timeout, $q, $http, $log, $uibModal, _, DEBUG, TheGraph, Links, Nodes, Models, CisApi, LocalStorageKeys, TheGraphSelection) {
  "use strict";
  
  // Support new YAML format?
  $scope.useConnections = false;
  
  $scope.showPalette = true;
  
  // Load up an empty graph
  let fbpGraph = TheGraph.fbpGraph;
  
  let height = $window.innerHeight
  let width = $window.innerWidth;
  
  $scope.state = {
    graph: new fbpGraph.Graph(),
    loading: true,
    height: height,
    width: width,
    library: []
  };
  
  // Enable DEBUG features?
  $scope.DEBUG = DEBUG;
  
  $scope.lastSavedNodes = [];
  $scope.lastSavedEdges = [];
  
  /**
   * Window resize event handling
   */
  angular.element($window).on('resize', function () {
    $scope.$apply(function() {
      $scope.state.width = $window.innerWidth;
      $scope.state.height = $window.innerHeight;
      console.log(`Editor width/height: ${$scope.state.width}/${$scope.state.height}`);
    });
  
    // manual $digest required as resize event is outside of angular
    $scope.$digest();
  });
  
  let editValue = null;
  
  // Update selected item when service data changes
  $scope.selectedItem = null;
  $scope.$watch(function() { return TheGraphSelection.selection; }, function(newValue, oldValue) {
    $scope.selectedItem = newValue;
    if (!oldValue && newValue && oldValue !== newValue) {
      // Clear out existing transaction if it was not saved
      if (editValue !== null) {
        $scope.cancelEdit();
      }
      // Start a new transaction
      $scope.state.graph.startTransaction("edit");
      editValue = angular.copy(newValue);
      
      /*$uibModal.open({
        animation: true,
        templateUrl: 'app/main/modals/editSelection.template.html',
        controller: 'EditSelectionCtrl',
        size: 'md',
        keyboard: false,      // Force the user to explicitly click "Close"
        backdrop: 'static',   // Force the user to explicitly click "Close"
        resolve: {
          selectedItem: () => angular.copy(newValue)
        }
      });*/
    }
  });
  
  // Fetch our model library
  $scope.state.library = {};
  $log.debug('Fetching models...');
  CisApi.get_models().then(function(data) {
    $log.debug("Fetched models:", data);
    $scope.state.library = data;
  }, function() {
    $log.debug('Failed to fetch models... Falling back to static data.');
    
    // In case of error, fall back to reading from static file
    $http.get('/data/models.json').then(function(response) {
      $scope.state.library = response.data;
    })
  }).finally(function() {
    // Load from localStorage once models are fetched
    let nodes = angular.fromJson($window.localStorage.getItem(LocalStorageKeys.nodes));
     
    // Import our previous state, if one was found
    if (nodes && nodes.length) {
      // Import all nodes from localStorage into TheGraph
      angular.forEach(nodes, node => { $scope.state.graph.addNode(node.id, node.component, node.metadata); });
      
      // Then, import all edges
      let edges = angular.fromJson($window.localStorage.getItem(LocalStorageKeys.edges));
      edges && angular.forEach(edges, edge => { $scope.state.graph.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, edge.metadata); });
      
      // Store our previously saved state
      $scope.lastSavedNodes = angular.copy($scope.state.graph.nodes);
      $scope.lastSavedEdges = angular.copy($scope.state.graph.edges);
    }
  
    $scope.state.loading = false;
  });
  
  $scope.saveEdit = function() {
    console.log("Saving over previous value:", editValue);
    console.log("Saved!");
    editValue.metadata = $scope.selectedItem.metadata;
    editValue = null;
    TheGraphSelection.selection = null;
    $scope.state.graph.endTransaction("edit");
  };
  
  $scope.cancelEdit = function() {
    console.log("Canceled!");
    $scope.selectedItem.metadata = editValue.metadata;
    editValue = null;
    TheGraphSelection.selection = null;
    $scope.state.graph.endTransaction("edit");
  };
  
  $scope.graphIsChanged = function() {
    let changed = false;
    angular.forEach($scope.state.graph.nodes, function(node) {
      
    });
    
    return changed;
    //return $scope.lastSavedNodes !== $scope.state.graph.nodes || 
    //       $scope.lastSavedEdges !== $scope.state.graph.edges;
  };
  
  $scope.saveGraph = function() {
    $window.localStorage.setItem(LocalStorageKeys.nodes, angular.toJson($scope.state.graph.nodes));
    $window.localStorage.setItem(LocalStorageKeys.edges, angular.toJson($scope.state.graph.edges));
    
    $scope.lastSavedNodes = angular.copy($scope.state.graph.nodes);
    $scope.lastSavedEdges = angular.copy($scope.state.graph.edges);
  };
  
  /** Clears out the current graph, returns true if cleared */
  $scope.clearGraph = function() {
    let result = confirm("Are you sure you want to clear your canvas?\nAll saved graph data will be cleared.");
    if (result) {
      $scope.state.graph = new fbpGraph.Graph();
      $scope.saveGraph();
    }
    return result
  };
  
  /** Adds an inport to the current graph */
  $scope.addInport = function() {
    // Add a new inport to the graph, then select it for editing
    TheGraphSelection.selection = $scope.addNodeInstance($scope.state.library['inport']);
  };
  
  /** Adds an outport to the current graph */
  $scope.addOutport = function() {
    // Add a new outport to the graph, then select it for editing
    TheGraphSelection.selection = $scope.addNodeInstance($scope.state.library['outport']);
  };
  
  /** Simple filter function */
  $scope.getModelOptions = function(library) {
    if (!library || !Object.keys(library).length) {
      return []
    }
    return _.omit(library, ['inport', 'outport']);
  };
  
  /** Simple filter function */
  $scope.getDataOptions = function(library) {
    if (!library || !Object.keys(library).length) {
      return []
    }
    let inport = _.find(library, ['name', 'inport']);
    let outport = _.find(library, ['name', 'outport']);
    return [inport, outport]
    
  };
  
  /** Simple random function */
  $scope.getRandomFrom = function(items) {
    let len = items.length || Object.keys(items).length
    let ran = Math.random()*len;
    let floor = Math.floor(ran);
  	return items[floor];
  };
  
  /** Adds a random node */
  $scope.addNodeInstance = function(model) {
    // Assign a pseudorandom ID
    let id = Math.round(Math.random()*100000).toString(36);
    
    // Build up metadata for our new instance
    let metadata = {
      label: model.label,
      x: Math.round(Math.random()*800),
      y: Math.round(Math.random()*600)
    };
    let newNode = $scope.state.graph.addNode(id, model.name, metadata);
    return newNode;
  };
  
  $scope.graphHasModel = function(modelKey) {
    let exists = _.find($scope.state.graph.nodes, ["component", modelKey]);
    return exists;
  };
  
  /** Exports the current graph to JSON */
  $scope.exportGraph = function() {
    $scope.showResults({ results: $scope.state.graph.toJSON(), title: "View Raw Graph", isJson: true });
  };
  
  $scope.formatting = false;
  $scope.formatYaml = function() {
    let modelCounter = 1;
    let getModelFromNode = (node) => {
      let model =  _.find($scope.state.library, ['name', node.component]);
      // TODO: ModelDriver / type / name
      model.id = modelCounter++;
      angular.forEach(model.inports, (port) => port.model_id = model.name);
      angular.forEach(model.outports, (port) => port.model_id = model.name);
        
      model.inputs = model.inports;
      model.outputs = model.outports;
      
      return model;
    };
    
    let getSrcNodeFromEdge = (edge) => _.find($scope.state.graph.nodes, ['id', edge.from.node]);
    let getDestNodeFromEdge = (edge) => _.find($scope.state.graph.nodes, ['id', edge.to.node]);
    let getOutportFromModel = (portName, model) => _.find(model.outports, ['name', portName]);
    let getInportFromModel = (portName, model) => _.find(model.inports, ['name', portName]);
    
    // Format nodes as the API expects
    let nodes = [];
    $log.debug("Transforming nodes: ", $scope.state.graph.nodes);
    angular.forEach($scope.state.graph.nodes, function(node) {
      if (node.component === 'inport' || node.component === 'outport') {
        return;
      }
      let model = getModelFromNode(node);
      
      // TODO: Read ModelDriver / args from model object
      let args = model.args;
      let driver = model.driver;
      
      let inputs = [];
      if (model.inports.length > 1) {
        angular.forEach(model.inports, function(item) { inputs.push(item.label || item.name); });
      } else if (model.inports.length === 1)  {
        inputs = model.inports[0].label;
      }
      
      let outputs = [];
      if (model.outports.length > 1) {
        angular.forEach(model.outports, function(item) { outputs.push(item.label || item.name); });
      } else if (model.outports.length === 1) {
        outputs = model.outports[0].label;
      }
      
      let newModel = {
        //id: nodeCount++, //node.id, 
        //model: model,
        name: model.label || model.name || node.id,
        args: args,
        driver: driver,
        inputs: inputs,
        outputs: outputs
        //description: node.metadata.description,
      };
      
      if (model.cmakeargs) { newModel.cmakeargs = model.cmakeargs }
      if (model.makefile) { newModel.makefile = model.makefile }
      if (model.makedir) { newModel.makedir = model.makedir }
      if (model.sourcedir) { newModel.sourcedir = model.sourcedir }
      if (model.builddir) { newModel.builddir = model.builddir }
      if (model.preserve_cache) { newModel.preserve_cache = model.preserve_cache }
      
      nodes.push(newModel);
    });
    
    // Format edges as the API expects
    let edges = [];
    let connections = [];
    $log.debug("Transforming edges: ", $scope.state.graph.edges);
    angular.forEach($scope.state.graph.edges, function(edge) {
      let src_node = getSrcNodeFromEdge(edge);
      let dest_node = getDestNodeFromEdge(edge);
      let src_model = getModelFromNode(src_node);
      let dest_model = getModelFromNode(dest_node);
      let src_port = getOutportFromModel(edge.from.port, src_model);
      let dest_port = getInportFromModel(edge.to.port, dest_model);
      
      // Add model_id? is this even necessary?
      src_port.model_id = src_model.name;
      dest_port.model_id = dest_model.name;
      
      // Add node_id? is this even necessary?
      src_port.node_id = src_node.id;
      dest_port.node_id = dest_node.id;
      
      let id = src_node.id + ":" + src_port.name + "_" + dest_node.id + ":" + dest_port.name;
      
      // TODO: edge name / type
      let args = edge.metadata.name; // || 'unused';
      let type = edge.metadata.type; // || 'InputDriver';
      if (src_model.name == 'inport') {
        args = src_node.metadata.name;
        if (src_node.metadata.type === 'File') {
          type = 'FileInputDriver';
        } else {
          args = id
          type = 'InputDriver'
        }
      } else if (dest_model.name == 'outport') {
        args = dest_node.metadata.name;
        type = dest_node.metadata.type;
        if (dest_node.metadata.type === 'File') {
          type = 'FileOutputDriver';
        } else {
          args = id
          type = 'OutputDriver'
        }
      }
      
      
      // TODO: Reconnect to API
      edges.push({ 
        id: id, 
        name: edge.metadata.label || edge.id || id,
        type: type,
        args: args, 
        source: src_port,
        destination: dest_port,
        //description: node.metadata.description,
      });
      let connection = {
        input: src_port.label || src_node.metadata.name,
        output: dest_port.label || dest_node.metadata.name
      };
      
      if (src_node.metadata['read_meth']) {
        connection['read_meth'] = src_node.metadata['read_meth']
      }
      
      if (dest_node.metadata['write_meth']) {
        connection['write_meth'] = dest_node.metadata['write_meth']
      }
      
      if (edge.metadata['field_names']) {
        connection['field_names'] = edge.metadata['field_names']
      }
      
      if (edge.metadata['field_units']) {
        connection['field_units'] = edge.metadata['field_units']
      }
      
      connections.push(connection);
    });
    
    let toYaml = { nodes: nodes, edges: edges, connections: connections };
    
    console.log("Submitting for formatting", toYaml);
    $scope.showResults({ title: "Formatted Manifest", results: toYaml });
    
    /* TODO: Neutered this API call for now
    $scope.formatting = true;
    
    console.log("Sending nodes: ", nodes);
    console.log("Sending edges: ", edges);
    
    CisApi.post_graphs({ 
      body: {
        nodes: nodes,
        edges: edges
      }
    }).then(function(data) {
      $scope.showResults({ results: data, title: "View Graph YAML", isJson: false });
    }, function() {
      $log.error("Failed to send to graph to API server");
      alert("Error submitting request: is the server running?");
    }).finally(function() {
      $scope.formatting = false;
    });
    */
  };
  
  $scope.running = false;
  $scope.runGraph = function() {
    $scope.running = true;
    alert("Coming Soon!");
    $scope.running = false;
  };
  
  
  /**
   * Display a modal window showing details about the requested resource
   * @param {} results - the result to show in the modal body
   * @param {} isJson - if false, format as YAML
   */ 
  $scope.showResults = function(params) { 
    $uibModal.open({
      animation: true,
      templateUrl: 'app/main/modals/' + (params.isJson ? 'exportJson.template.html' : 'generateYaml.template.html'),
      controller: params.isJson ? 'ExportJsonCtrl' : 'GenerateYamlCtrl',
      size: 'md',
      keyboard: false,      // Force the user to explicitly click "Close"
      backdrop: 'static',   // Force the user to explicitly click "Close"
      resolve: {
        results: () => params.results,
        title: () => params.title || "View Details"
      }
    });
  };
}]);
