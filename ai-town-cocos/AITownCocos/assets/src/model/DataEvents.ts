export interface DataEvents {
  items: any;
  bid:number,	
  actionId: number;
  npcId: number;
  users: any;
  params?: {
    npcId: any;
    price: any;
    count?: any;
    oid?: string;

    items?: {
        itemId: number,
        count: number
    }[];
    itemId?: number
  };
}

export interface DataFarmEvent {
    bid:number,	
    actionId: number,
    npcId: number,
    isFinish:number,
    x:number,
    y:number,
    objId:string,
    state:number,
    users: any,
    params: {
        oid: string,
        itemId:10101001
    }
}
