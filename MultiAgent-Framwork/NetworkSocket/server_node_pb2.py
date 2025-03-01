# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: server_node.proto

import sys
_b=sys.version_info[0]<3 and (lambda x:x) or (lambda x:x.encode('latin1'))
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='server_node.proto',
  package='com.infinity.protocol',
  syntax='proto3',
  serialized_options=None,
  serialized_pb=_b('\n\x11server_node.proto\x12\x15\x63om.infinity.protocol\"\xa9\x01\n\x0bserver_node\x12\x0f\n\x07node_id\x18\x01 \x01(\t\x12\x0e\n\x06ip_lan\x18\x02 \x01(\x05\x12\x11\n\tip_public\x18\x03 \x01(\x05\x12\x10\n\x08port_lan\x18\x04 \x01(\x05\x12\x13\n\x0bport_public\x18\x05 \x01(\x05\x12\x0e\n\x06\x64omain\x18\x06 \x01(\t\x12\x10\n\x08udp_port\x18\x07 \x01(\x05\x12\x0f\n\x07\x63hannel\x18\x08 \x01(\x05\x12\x0c\n\x04type\x18\t \x01(\tb\x06proto3')
)




_SERVER_NODE = _descriptor.Descriptor(
  name='server_node',
  full_name='com.infinity.protocol.server_node',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='node_id', full_name='com.infinity.protocol.server_node.node_id', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='ip_lan', full_name='com.infinity.protocol.server_node.ip_lan', index=1,
      number=2, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='ip_public', full_name='com.infinity.protocol.server_node.ip_public', index=2,
      number=3, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='port_lan', full_name='com.infinity.protocol.server_node.port_lan', index=3,
      number=4, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='port_public', full_name='com.infinity.protocol.server_node.port_public', index=4,
      number=5, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='domain', full_name='com.infinity.protocol.server_node.domain', index=5,
      number=6, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='udp_port', full_name='com.infinity.protocol.server_node.udp_port', index=6,
      number=7, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='channel', full_name='com.infinity.protocol.server_node.channel', index=7,
      number=8, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='type', full_name='com.infinity.protocol.server_node.type', index=8,
      number=9, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=_b("").decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=45,
  serialized_end=214,
)

DESCRIPTOR.message_types_by_name['server_node'] = _SERVER_NODE
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

server_node = _reflection.GeneratedProtocolMessageType('server_node', (_message.Message,), {
  'DESCRIPTOR' : _SERVER_NODE,
  '__module__' : 'server_node_pb2'
  # @@protoc_insertion_point(class_scope:com.infinity.protocol.server_node)
  })
_sym_db.RegisterMessage(server_node)


# @@protoc_insertion_point(module_scope)
