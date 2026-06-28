export enum Feature {
  FREE_LAYER_4 = 'FREE_LAYER_4',
  FREE_LAYER_7 = 'FREE_LAYER_7',
  ADVANCED_LAYER_4 = 'ADVANCED_LAYER_4',
  ADVANCED_LAYER_7 = 'ADVANCED_LAYER_7',
  API_ACCESS = 'API_ACCESS',
  VIP_ACCESS = 'VIP_ACCESS'
}

export class Plans {
  static readonly FREE = [
    Feature.FREE_LAYER_4,
    Feature.FREE_LAYER_7
  ];
  static readonly ADVANCED = [
    ...this.FREE,
    Feature.ADVANCED_LAYER_4,
    Feature.ADVANCED_LAYER_7
  ];
  static readonly VIP = [
    ...this.ADVANCED,
    Feature.VIP_ACCESS
  ];
  static readonly BUSINESS = [
    ...this.VIP,
    Feature.API_ACCESS
  ];
}