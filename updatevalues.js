// updatevalues.js

'use strict';
 

const shim = require('fabric-shim');

const query = require('./query.js');

// SDK Library to asset with writing the logic
const { Contract } = require('fabric-contract-api');
 
/**
 * Support the Updating of values within the SmartContract.
 */

class UpdateValuesContract extends Contract {
 
    constructor() {
        super('org.mynamespace.updates');
    }


     async Init(stub) {
        let ret = stub.getFunctionAndParameters();
        let params = ret.params;
        if (params.length != 2) {
            return shim.error("Incorrect number of arguments. Expecting 2");
        }
        let A = params[0];
        let B = params[1];

        try {
            await stub.putState(A, Buffer.from(B));
            return shim.success(Buffer.from("success"));
        } catch (e) {
            return shim.error(e);
        }
     } 

    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
          console.error('no function of name:' + ret.fcn + ' found');
          throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
          console.log('Function called is : ' + ret.fcn + ' and was found');
          let payload = await method(stub, ret.params);
          return shim.success(payload);
        } catch (err) {
          console.log(err);
          return shim.error(err);
        }
    }
    
    async transactionA(ctx, args) {
       
        console.log("now inside transaction A function");
        let key = args[0]; 
        let newValue = args[1]; 
        // retrieve existing chaincode states
        let oldValue = await ctx.getState(key);
        console.log("called transaction A key is " + key + "value is " + oldValue); 
        await ctx.putState(key, Buffer.from(newValue));
 
        return Buffer.from(newValue.toString());
    }
 
    async transactionB(ctx, args) {

        console.log("now inside transaction A function");
        let key = args[0]; 
        let newValue = args[1]; 
        // retrieve existing chaincode states
        let oldValue = await ctx.getState(key);
        console.log("called transaction B key is " + key + "value is " + oldValue); 
 
        await ctx.putState(key, Buffer.from(newValue));
 
        return Buffer.from(newValue.toString());
    }
 
    async getValues(ctx, args) {
        if (args.length != 1) {
            return shim.error("Incorrect number of arguments. Expecting 1");
        }
        try {
            return await ctx.getState(args[0]);
        } catch (e) {
            return shim.error(e);
        }
    }


   async getHistoryQ(ctx, args) {
      //console.log(' getHistory queryString:\n' + queryString);
      console.log("getHistory function:  ");
      let queryString = args[0];
      let resultsIterator = await ctx.getQueryResult(queryString);
      let method = Query['getAllResults'];

      let results = await method(resultsIterator, false);
      console.log("Results are as follows: " + results);
      return Buffer.from(JSON.stringify(results));
   }

    async keyHistory(stub, key) {
    	console.info('inside history function FYI');
    	const iterator = await stub.getHistoryForKey('A1');
    	let results = [];
    	let res = {done : false};
    	while (!res.done) {
        	res = await iterator.next();

        	if (res && res.value && res.value.value) {
            	   let val = res.value.value.toString('utf8');
            	   if (val.length > 0) {
                	results.push(JSON.parse(val));
                   }
                }
        	if (res && res.done) {
             	  try {
                	iterator.close();
            	  }
            	  catch (err) {
            	  }
                }
        console.log("results are " + results);
        //return results;
        return 0;
        } // while
    } // async function History
};
 

module.exports = UpdateValuesContract;


shim.start(new UpdateValuesContract());
