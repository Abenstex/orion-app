#!/bin/bash

npx protoc --proto_path=/home/chren/dev/GoProjekte/orion/api/proto/ --ts_out "./src/generated" --ts_opt long_type_bigint ui.proto user.proto orion_common.proto misc.proto
npx protoc --proto_path=/home/chren/dev/GoProjekte/laniakea/protos/ --ts_out "./src/generated" --ts_opt long_type_bigint common.proto
