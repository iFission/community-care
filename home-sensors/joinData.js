msg.db = { _id: msg.payload._id, _rev: msg.payload._rev };
msg.payload = msg.data;
msg.payload["_id"] = msg.db._id;
msg.payload["_rev"] = msg.db._rev;

return msg;
