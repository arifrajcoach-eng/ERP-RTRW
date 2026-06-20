import { 
  dbGateway, 
  gatewayDoc, 
  gatewayCollection, 
  gatewayQuery, 
  gatewayWhere, 
  gatewayLimit, 
  gatewayOrderBy, 
  gatewayWriteBatch, 
  gatewayServerTimestamp, 
  gatewayGetDocFromServer,
  gatewayAddDoc,
  gatewayGetCountFromServer
} from "./dbGateway";

export const collection = gatewayCollection;
export const doc = gatewayDoc;
export const query = gatewayQuery;
export const where = gatewayWhere;
export const limit = gatewayLimit;
export const orderBy = gatewayOrderBy;
export const getDocs = dbGateway.getDocs;
export const getDoc = dbGateway.getDoc;
export const onSnapshot = dbGateway.onSnapshot;
export const setDoc = dbGateway.setDoc;
export const updateDoc = dbGateway.updateDoc;
export const deleteDoc = dbGateway.deleteDoc;
export const writeBatch = gatewayWriteBatch;
export const serverTimestamp = gatewayServerTimestamp;
export const getDocFromServer = gatewayGetDocFromServer;
export const addDoc = gatewayAddDoc;
export const getCountFromServer = gatewayGetCountFromServer;
