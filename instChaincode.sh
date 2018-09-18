#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
#LANGUAGE=${1:-"node"}

LANGUAGE="node"

# $1 is the parameter for chaincode interaction: eg. install, instantiate, initial invoke, further transactional invokes etc

if [ "$LANGUAGE" = "node" -o "$LANGUAGE" = "NODE" ]; then
	CC_SRC_PATH=/opt/gopath/src/github.com/mycontract
fi

# NOTE: THESE ARE ALL RUN FROM THE CLI CONTAINER eg docker exec -it cli /bin/bash  etc
# Now install / instantiate the chaincode - 

[ "$1" = "install" ] && docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_CHAINCODE_STARTUPTIMEOUT=1200s" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n mycontract -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"

sleep 10

# need to specify namespace for instantiation ("initialise")

[ "$1" = "init" ] && docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_CHAINCODE_STARTUPTIMEOUT=2400s" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n mycontract -l "$LANGUAGE" -v 1.0 -c '{"Args":["org.mynamespace.updates_Init"]}' -P "OR ('Org1MSP.member','Org2MSP.member')"


sleep 10

[ "$1" = "invoke" ] && docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_CHAINCODE_EXECUTETIMEOUT=1200s"  -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n mycontract -c '{"Args":["InitContract","A1","33"]}'

[ "$1" = "invokeA" ] && docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n mycontract -c '{"Args":["transactionA","A1","44"]}'

[ "$1" = "invokeB" ] && docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n mycontract -c '{"Args":["keyHistory","A1"]}'

