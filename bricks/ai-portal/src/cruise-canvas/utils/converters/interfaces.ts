export interface View {
  viewId: string;
  // url: string;
  title: string;
}

export interface ViewWithInfo extends View {
  dataSources: DataSource[];
  variables: Variable[];
  components: Component[];
  eventListeners: EventListener[];
}

export interface DataSource {
  viewId: string;
  name: string;
  api: {
    name: string;
    version: string;
    // objectId?: string;
  };
  params?: Record<string, any>;
  transform?: string;
}

export interface Variable {
  viewId: string;
  name: string;
  value: any;
}

export interface Component {
  viewId: string;
  componentId: string;
  parentComponentId?: string;
  componentName: string;
  properties?: Record<string, unknown>;
}

export interface EventListener {
  viewId: string;
  componentId: string;
  event: string;
  handler: any;
}

export interface Api {
  name: string;
  version: string;
  description: string;
  objectId?: string;
  parameters: any;
}

export interface ObjectDefinition {
  objectId: string;
  name: string;
  attrs: ObjectAttribute[];
}

export interface ObjectAttribute {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface ObjectWithMetrics {
  objectId: string;
  name: string;
  metrics: ObjectMetric[];
}

export interface ObjectMetric {
  id: string;
  name: string;
  unit: string;
}
