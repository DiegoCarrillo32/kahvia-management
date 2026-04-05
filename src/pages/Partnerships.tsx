import { useState, useEffect } from 'react';
import { 
  Box, Flex, Heading, Text, Button, Input, useToast, 
  Tabs, TabList, TabPanels, Tab, TabPanel, 
  Badge, HStack, VStack, Divider, IconButton, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Select, Textarea, FormControl
} from '@chakra-ui/react';
import { Copy, Users, Send, Check, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { ensureInviteCode } from '../services/userService';
import { 
  usePartnerships, useRequestPartnership, useAcceptPartnership, useRejectPartnership 
} from '../hooks/usePartnerships';
import { 
  useB2BRequests, useSendB2BRequest, useAddRequestUpdate 
} from '../hooks/useB2BRequests';
import { B2BRequest, B2BRequestStatus } from '../types/partnership';

export default function Partnerships() {
  const { userProfile, user } = useAuth();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteInput, setInviteInput] = useState('');
  
  const toast = useToast();
  
  const { data: partnerships = [] } = usePartnerships();
  const { data: b2bRequests = [] } = useB2BRequests();
  
  const { mutateAsync: requestPartnership, isPending: requesting } = useRequestPartnership();
  const { mutateAsync: acceptPartnership } = useAcceptPartnership();
  const { mutateAsync: rejectPartnership } = useRejectPartnership();

  useEffect(() => {
    if (user && userProfile && !inviteCode) {
      ensureInviteCode(user.uid, userProfile).then(code => setInviteCode(code));
    }
  }, [user, userProfile, inviteCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({ title: 'Código copiado', status: 'success', duration: 2000 });
  };

  const handleSendInvite = async () => {
    if (!inviteInput || inviteInput.length < 6) return;
    try {
      await requestPartnership(inviteInput);
      toast({ title: 'Solicitud enviada correctamente', status: 'success' });
      setInviteInput('');
    } catch (e: unknown) {
      toast({ title: (e as Error).message || 'Error al enviar solicitud', status: 'error' });
    }
  };

  // Derived state from partnerships
  const myActivePartners = partnerships.filter(p => p.status === 'active');
  const incomingPending = partnerships.filter(p => p.status === 'pending' && p.receiverId === user?.uid);

  // Derived state from requests
  const incomingRequests = b2bRequests.filter(r => r.receiverId === user?.uid);
  const outgoingRequests = b2bRequests.filter(r => r.senderId === user?.uid);

  return (
    <Box p={{ base: 4, md: 8 }} pb={{ base: 24, md: 8 }} bg="var(--color-white-pergamino)" minH="100vh">
      <Heading as="h1" size={{ base: "md", md: "lg" }} color="var(--color-expresso)" fontFamily="heading" mb={6}>
        B2B & Partnerships
      </Heading>

      <Tabs colorScheme="red" variant="enclosed">
        <TabList>
          <Tab _selected={{ color: 'white', bg: 'var(--color-warm-roast)' }} fontWeight="bold">Red de Socios</Tab>
          <Tab _selected={{ color: 'white', bg: 'var(--color-warm-roast)' }} fontWeight="bold">
            Bandeja B2B
            {(incomingRequests.filter(r => r.status === 'pending').length > 0) && (
              <Badge ml={2} colorScheme="red" borderRadius="full">
                {incomingRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: RED DE SOCIOS */}
          <TabPanel px={0} py={6}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <Box bg="white" p={6} borderRadius="xl" shadow="sm" borderWidth={1} display="flex" flexDirection="column" gap={4}>
                <Heading size="sm" color="gray.600">Mi Código de Invitación</Heading>
                <Text fontSize="sm" color="gray.500">Comparte este código para que otros puedan enviarte solicitudes de conexión B2B.</Text>
                <Flex bg="gray.50" p={4} borderRadius="md" align="center" justify="space-between" borderWidth={1} borderStyle="dashed">
                  <Text fontFamily="heading" fontSize="2xl" color="var(--color-expresso)" letterSpacing={2}>
                    {inviteCode || 'Cargando...'}
                  </Text>
                  <IconButton aria-label="Copiar" icon={<Copy size={16} />} onClick={handleCopyCode} variant="ghost" />
                </Flex>
                
                <Divider my={2} />
                
                <Heading size="sm" color="gray.600">Añadir Nuevo Socio</Heading>
                <Flex gap={2}>
                  <Input 
                    placeholder="Ej. K9A2XL" 
                    value={inviteInput} 
                    onChange={e => setInviteInput(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <Button 
                    bg="var(--color-warm-roast)" 
                    color="white" 
                    _hover={{ bg: "var(--color-expresso)" }}
                    onClick={handleSendInvite}
                    isLoading={requesting}
                  >
                    Conectar
                  </Button>
                </Flex>
              </Box>

              <Box gridColumn={{ lg: "span 2" }}>
                {/* Incoming Requests */}
                {incomingPending.length > 0 && (
                  <Box mb={6}>
                    <Heading size="sm" mb={3} color="red.600">Solicitudes Entrantes</Heading>
                    <VStack spacing={3} align="stretch">
                      {incomingPending.map(p => (
                        <Flex key={p.id} bg="white" p={4} borderRadius="lg" shadow="sm" borderWidth={1} justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="bold" color="var(--color-expresso)">{p.requesterBusinessName}</Text>
                            <Text fontSize="xs" color="gray.500">Desea conectar en Kahvia</Text>
                          </Box>
                          <HStack>
                            <IconButton aria-label="Rechazar" icon={<X size={16}/>} size="sm" colorScheme="red" variant="outline" onClick={() => rejectPartnership(p.id!)} />
                            <IconButton aria-label="Aceptar" icon={<Check size={16}/>} size="sm" colorScheme="green" onClick={() => acceptPartnership(p.id!)} />
                          </HStack>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Active Partners */}
                <Box>
                  <Heading size="sm" mb={3} color="gray.600">Mis Socios Activos ({myActivePartners.length})</Heading>
                  {myActivePartners.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">Aún no tienes socios vinculados.</Text>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                      {myActivePartners.map(p => {
                        const partnerName = p.requesterId === user?.uid ? p.receiverBusinessName : p.requesterBusinessName;
                        return (
                          <Box key={p.id} bg="white" p={4} borderRadius="lg" shadow="sm" borderWidth={1}>
                            <Flex align="center" gap={3}>
                              <Box bg="var(--color-white-pergamino)" p={2} borderRadius="full">
                                <Users size={20} color="var(--color-warm-roast)" />
                              </Box>
                              <Text fontWeight="bold" color="var(--color-expresso)">{partnerName}</Text>
                            </Flex>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </Box>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* TAB 2: BANDEJA B2B */}
          <TabPanel px={0} py={6}>
            <B2BInbox 
              incoming={incomingRequests} 
              outgoing={outgoingRequests} 
              partners={myActivePartners} 
              currentUid={user?.uid || ''} 
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

// Sub-component for Bandeja B2B to keep the file perfectly clean
function B2BInbox({ incoming, outgoing, partners, currentUid }: { incoming: B2BRequest[], outgoing: B2BRequest[], partners: { id?: string; requesterId: string; receiverId: string; requesterBusinessName: string; receiverBusinessName: string; }[], currentUid: string }) {
  const { isOpen: isNewOpen, onOpen: onNewOpen, onClose: onNewClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const [selectedRequest, setSelectedRequest] = useState<B2BRequest | null>(null);

  const { mutateAsync: sendRequest, isPending: sending } = useSendB2BRequest();
  const { mutateAsync: addUpdate, isPending: updating } = useAddRequestUpdate();

  // New Request Form State
  const [newPartnerId, setNewPartnerId] = useState('');
  const [newType, setNewType] = useState('Café Verde');
  const [newMessage, setNewMessage] = useState('');

  // Update Status Form State
  const [updateStatus, setUpdateStatus] = useState<B2BRequestStatus>('in_progress');
  const [updateMessage, setUpdateMessage] = useState('');
  
  const toast = useToast();

  const handleSendNew = async () => {
    if (!newPartnerId || !newType || !newMessage) {
      toast({ title: 'Rellena los campos!', status: 'warning' });
      return;
    }
    const partner = partners.find(p => p.receiverId === newPartnerId || p.requesterId === newPartnerId);
    if(!partner) return;

    const actualReceiverId = partner.receiverId === currentUid ? partner.requesterId : partner.receiverId;
    const actualReceiverName = partner.receiverId === currentUid ? partner.requesterBusinessName : partner.receiverBusinessName;

    try {
      await sendRequest({
        partnershipId: partner.id!,
        receiverId: actualReceiverId,
        receiverBusinessName: actualReceiverName,
        type: newType,
        message: newMessage
      });
      toast({ title: 'Pedido enviado', status: 'success' });
      setNewPartnerId(''); setNewMessage('');
      onNewClose();
    } catch {
      toast({ title: 'Error al enviar pedido', status: 'error' });
    }
  };

  const handleSendUpdate = async () => {
    if(!selectedRequest?.id || !updateMessage) return;
    try {
      await addUpdate({
        requestId: selectedRequest.id,
        newStatus: updateStatus,
        updateMessage
      });
      toast({ title: 'Actualización registrada', status: 'success' });
      setUpdateMessage('');
      onDetailClose();
    } catch {
      toast({ title: 'Error', status: 'error' });
    }
  };

  const parseFirebaseDate = (timestamp: unknown): string => {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleString();
    const ts = timestamp as { toDate?: () => Date };
    if (ts.toDate) return ts.toDate().toLocaleString();
    return new Date(timestamp as string | number | Date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'yellow';
      case 'in_progress': return 'blue';
      case 'shipped': return 'purple';
      case 'fulfilled': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <Flex justify="space-between" mb={6}>
        <Heading size="md" color="var(--color-expresso)">Transacciones B2B</Heading>
        <Button size="sm" bg="var(--color-warm-roast)" color="white" leftIcon={<Send size={16}/>} onClick={onNewOpen}>
          Nuevo Pedido
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Incoming Column */}
        <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth={1}>
          <Heading size="sm" mb={4} color="gray.600">Pedidos Entrantes (A ti)</Heading>
          {incoming.length === 0 ? <Text color="gray.400" fontSize="sm">Vacío</Text> : (
            <VStack spacing={3} align="stretch">
              {incoming.map(r => (
                <Box key={r.id} p={3} borderWidth={1} borderRadius="lg" cursor="pointer" _hover={{ shadow: 'sm' }} onClick={() => { setSelectedRequest(r); onDetailOpen(); }}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontWeight="bold">{r.senderBusinessName}</Text>
                    <Badge colorScheme={getStatusColor(r.status)}>{r.status}</Badge>
                  </Flex>
                  <Text fontSize="xs" fontWeight="bold" color="var(--color-warm-roast)">{r.type}</Text>
                  <Text fontSize="sm" color="gray.600" isTruncated>{r.message}</Text>
                  <Text fontSize="xs" color="gray.400" mt={2}>{parseFirebaseDate(r.createdAt)}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Outgoing Column */}
        <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth={1}>
          <Heading size="sm" mb={4} color="gray.600">Pedidos Salientes (Tuyos)</Heading>
          {outgoing.length === 0 ? <Text color="gray.400" fontSize="sm">Vacío</Text> : (
            <VStack spacing={3} align="stretch">
              {outgoing.map(r => (
                <Box key={r.id} p={3} borderWidth={1} borderRadius="lg" cursor="pointer" _hover={{ shadow: 'sm' }} onClick={() => { setSelectedRequest(r); onDetailOpen(); }}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontWeight="bold">A: {r.receiverBusinessName}</Text>
                    <Badge colorScheme={getStatusColor(r.status)}>{r.status}</Badge>
                  </Flex>
                  <Text fontSize="xs" fontWeight="bold" color="var(--color-warm-roast)">{r.type}</Text>
                  <Text fontSize="sm" color="gray.600" isTruncated>{r.message}</Text>
                  <Text fontSize="xs" color="gray.400" mt={2}>{parseFirebaseDate(r.createdAt)}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>

      {/* NEW B2B MODAL */}
      <Modal isOpen={isNewOpen} onClose={onNewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Pedido B2B</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <Text fontSize="sm" fontWeight="bold" mb={1}>Socio Destinatario</Text>
                <Select value={newPartnerId} onChange={e => setNewPartnerId(e.target.value)}>
                  <option value="">Selecciona un socio...</option>
                  {partners.map(p => {
                    const actualId = p.receiverId === currentUid ? p.requesterId : p.receiverId;
                    const name = p.receiverId === currentUid ? p.requesterBusinessName : p.receiverBusinessName;
                    return <option key={actualId} value={actualId}>{name}</option>
                  })}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <Text fontSize="sm" fontWeight="bold" mb={1}>Tipo de Insumo</Text>
                <Select value={newType} onChange={e => setNewType(e.target.value)}>
                  <option value="Café Verde">Café Verde</option>
                  <option value="Café Tostado">Café Tostado</option>
                  <option value="Insumos">Insumos (Vasos, Tapas, etc)</option>
                  <option value="Otro">Otro</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <Text fontSize="sm" fontWeight="bold" mb={1}>Mensaje / Detalles</Text>
                <Textarea placeholder="Ej: Necesito 20kg de Grano Verde Gisha urgente..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNewClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleSendNew} isLoading={sending}>Enviar Pedido</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DETAILED REQUEST / UPDATE MODAL */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottomWidth={1}>Seguimiento de Pedido</ModalHeader>
          <ModalCloseButton />
          {selectedRequest && (
            <ModalBody py={4}>
              <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="bold">{selectedRequest.type}</Text>
                  <Badge colorScheme={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge>
                </Flex>
                <Text fontSize="sm">{selectedRequest.message}</Text>
              </Box>

              <Text fontWeight="bold" mb={3}>Línea de Tiempo</Text>
              <VStack align="stretch" spacing={4} mb={6}>
                {selectedRequest.updates.map((up, idx) => (
                  <Box key={idx} pl={4} borderLeftWidth={2} borderColor={up.updatedBy === currentUid ? 'var(--color-warm-roast)' : 'blue.400'}>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Badge colorScheme={getStatusColor(up.status)}>{up.status}</Badge>
                      <Text fontSize="xs" color="gray.500">{parseFirebaseDate(up.timestamp)}</Text>
                    </Flex>
                    <Text fontSize="sm">{up.message}</Text>
                  </Box>
                ))}
              </VStack>

              <Divider mb={4} />
              
              <Text fontWeight="bold" mb={2}>Agregar Actualización</Text>
              <Flex gap={2} mb={2}>
                <Select size="sm" flex={1} value={updateStatus} onChange={e => setUpdateStatus(e.target.value as B2BRequestStatus)}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="shipped">Shipped</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Flex>
              <Textarea size="sm" placeholder="Añadir comentario o respuesta..." mb={2} value={updateMessage} onChange={e => setUpdateMessage(e.target.value)} />
              <Button size="sm" colorScheme="red" w="100%" onClick={handleSendUpdate} isLoading={updating}>
                Guardar Actualización
              </Button>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}
