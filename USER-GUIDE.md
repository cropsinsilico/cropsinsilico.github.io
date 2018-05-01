# User Guide
Welcome to the User's Guide for the Crops in Silico Model Composer UI. This
document details the usage of the User Interface. If any of the steps described
in this document are unclear or confusing, please direct your questions to
[Crops in Silico Support](mailto:lambert8@illinois.edu)

# Orientation
* Navbar
* Model Library (aka "Palette")
* Button Bar
* Canvas (aka "The Graph")
* Context Menu + Edit Sidebar

# Adding a Node
The Model Library on the left side offers an "Add" button beside each model.
Click this button to add a new node to the canvas representing the model you've
chosen. On your node, you should see grey dots on the left/right sides - these
are the inputs (left side) and outputs (right side) that this model accepts.

# Adding an Edge
To create an edge, simply click on an output on a model - this should
display a floating edge that ends at your cursor. Then, select an input on 
another model. You can also choose an input first and connect that to an output.

NOTE: Inputs can only be connected to outputs and vice versa. An input cannot be
connected to another input. An output cannot be connected with another output.

# Adding an InPort / OutPort
While each node has its own set of inputs and outputs, the entire graph likely
will need InPorts/OutPorts of its own. The Button Bar at the top of the view
offers buttons to add these InPorts and OutPorts

# Right-Click Context Menu
In general, right-clicking an entity on the canvas will bring up a context menu
for the clicked object. We currently support right-click operations on Nodes, 
InPorts/OutPorts, and Edges.

## Nodes
Right-clicking a node will bring up the context menu, and allows you to delete the node or edit its metadata:
* ID (read-only): auto-generated pseudo-unique string identifier for this node
* Model (read-only): the underlying model that this node represents
* Label (optional): The identifier for this node that will appear in the canvas
* X (required): Current X coordinate of this Node on the canvas
* Y (required): Current Y coordinate of this Node on the canvas

You should also see the model inputs/ouputs displayed with the context menu
open. Just to the left of the context menu, you should see any inputs offered 
by this node. To the right, you will see its outputs. This allows you to easily
select an input or output and connect it to another model.

## InPorts / OutPorts
Right-clicking an InPort or OutPort will bring up the context menu, and allows you to delete it or edit its metadata:
* ID (read-only): auto-generated pseudo-unique string identifier for this node
* Model (read-only): the underlying model that this node represents
* Label (optional): The identifier for this node that will appear in the canvas
* Type (required): The type of this port - this can be either "File" or "Queue" (if using AMQP queues)
* Value (required): The value of this port - this will either be a filepath (for Type=File) or a queue name (for Type=Queue)
* Read/Write Method (optional): how are the contents formatted? can be any of 'table', 'table_array', 'pandas' or 'line'
* X (required): Current X coordinate of this Node on the canvas
* Y (required): Current Y coordinate of this Node on the canvas

## Edges
Right-clicking an edge will bring up the context menu, and allows you to delete the edge or edit its metadata:
* Label (optional): A friendly identifier for this edge (currently unused)
* Field Names (optional): If this edge contains multiple fields, you can specify their names as a comma-separated list of values
* Field Units (optional): If this edge contains multiple fields, you can specify their units as a comma-separated list of values

# Submitting a New Model
Do you have a new model that you would like to contribute? [The link in the
Navbar](https://goo.gl/forms/AcEhlzvNFsaVAg3H3) will allow you to submit a request for supporting a new model in the
Model Composer UI.

Simply click the link and fill out the Google Form. This
will submit a New Issue to our GitHub repository, and we will reach to let you
know when we start or if any further information is necessary.
