// updatevalues.js

'use strict';
 

const shim = require('fabric-shim');

const query = require('./query.js');

// need to require the fabric-contract-api Classes
const { Contract } = require('fabric-contract-api');
 
/**
 * Support the Updating of values within the SmartContract - constructor is within the defined NS
 */

class UpdateValuesContract extends Contract {
 
    constructor() {
        super('org.mynamespace.updates');
    }

     Init(stub) {

	    console.info('=========== Instantiated Sample chaincode ===========');
    //        await stub.putState('dummyKey', Buffer.from('dummyValue'))
            return shim.success();
     }

    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn] ;
        if (!method) {
          console.error('no function of name:' + ret.fcn + ' found');
          throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
          console.log('FQ Function called is : ' + ret.fcn  + ' was found with params ' + ret.params);
          let payload = await method(stub, ret.params);
          console.log('payload is ' + payload);
          return shim.success(payload);
        } catch (err) {
          console.log(err);
          return shim.error(err);
        }
    }
    
     async InitContract(ctx, args) {
        let A = args[0]; 
        let B = args[1]; 

	       console.info('=========== Invoked InitContract in chaincode ===========');
        await ctx.putState(A, Buffer.from(B));

        return Buffer.from(B.toString());
     } 

    async transactionA(ctx, args) {
       
        console.log("now inside transaction A function");
        let key = args[0]; 
        let newValue = args[1]; 
        // retrieve existing chaincode states
        let oldValue = await ctx.getState(key);
        console.log("called transaction A key with new value" + key + " oldvalue is " + oldValue); 
        await ctx.putState(key, Buffer.from(newValue));
 
        return Buffer.from(newValue.toString());
    }
 
    async transactionB(ctx, args) {

        console.log("now inside transaction B function");
        let key = args[0]; 
        let newValue = args[1]; 
        // retrieve existing chaincode states
        let oldValue = await ctx.getState(key);
        console.log("called transaction B key with new value " + key + " oldvalue is " + oldValue); 
 
        await ctx.putState(key, Buffer.from(newValue));
 
        return Buffer.from(newValue.toString());
    }
 
    // Helper functions - can go into a Utils class
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

// query based history
   async getHistoryQuery(ctx, args) {
    
      let queryString = args[0];
      //console.log(' getHistory queryString:\n' + queryString);
      console.log("getHistory function:  ");
      let queryString = args[0];
      let resultsIterator = await ctx.getQueryResult(queryString);
      let method = Query['getAllResults'];

      let results = await method(resultsIterator, false);
      console.log("Results are as follows: " + results);
      return Buffer.from(JSON.stringify(results));
   }

 // simple history
    async keyHistory(ctx, args) {
    	console.info('inside history function FYI');
     let key = args[0];
    	const iterator = await stub.getHistoryForKey(key);
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
        console.log("Results are as follows: " + results);
        //return results;
        return 0;
        } // while
    } // async function History
};
 

module.exports = UpdateValuesContract;


shim.start(new UpdateValuesContract());
