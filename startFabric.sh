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
LANGUAGE=${1:-"node"}

# clean the keystore
rm -rf ./hfc-key-store

# launch startup of the FABRIC network; create channel and join peer to channel - need the crypto material from basic-network
./startFabricJoinChannel.sh


# Now launch the FABRIC CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars

docker-compose -f docker-compose-fabric.yaml up -d cli

# Launch and instantiate the chaincode in the script startChaincode.sh using a separate invocation, so to speak


printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
printf "Start by installing required packages run 'npm install'\n"
printf "Then run 'node enrollAdmin.js', then 'node registerUser'\n\n"
printf "The 'node invoke.js' will fail until it has been updated with valid arguments\n"
printf "The 'node query.js' may be run at anytime once the user has been registered\n\n"
